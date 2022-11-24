import Redis from 'ioredis'
import AppUtil from '@/utils/AppUtil'

const LOG_TAG = 'RedisUtil'

class RedisUtil {
  constructor() {
    this.DEF_OPTION = {
      host: '',
      port: 1,
      password: '',
      db: 0
    }
  }

  /**
   * disconnect the redis
   */
  async disconnect(redis) {
    if (redis && redis.conn) {
      await redis.conn.disconnect()
    }
    if (redis && redis.clusterConns) {
      for (let i = 0; i < redis.clusterConns.length; i++) {
        await redis.clusterConns[i].disconnect()
      }
    }
  }

  /**
   * private, get the real redis connection
   */
  async getConn(option) {
    const url = `redis://${option.host}:${option.port}/${option.db}`
    AppUtil.log.info(LOG_TAG, `connect, ${url}`)
    let conn
    let err = null
    try {
      conn = new Redis(`redis://${option.host}:${option.port}/${option.db}`, {
        password: option.password,
        lazyConnect: true,
        connectTimeout: 3000
      })
      conn.on('error', (e) => {
        err = e
      })
      await conn.connect()
      await conn.select(option.db)
    } catch (e) {
      conn.disconnect()
      const mixErr = err || e
      AppUtil.log.error(LOG_TAG, `connect fail, ${url} ${mixErr.message}`)
      throw new Error(`Connect fail, ${mixErr.message}`)
    }
    AppUtil.log.info(LOG_TAG, `connect success, ${url}`)
    return conn
  }

  /**
   * connect to the redis, and return redis object
   */
  async connect(option) {
    option = Object.assign({}, this.DEF_OPTION, option)
    const conn = await this.getConn(option)
    let mode = 'standalone'
    try {
      const clusterInfoRet = await conn.cluster('info')
      if (clusterInfoRet.indexOf('cluster_state') >= 0) {
        mode = 'cluster'
      }
    } catch (ignored) {
      // ignored
    }

    // redis
    return {
      mode: mode,
      option: option,
      conn: await this.getConn(option),
      clusterConns: []
    }
  }

  async scan(redis, cursor, pattern, cnt) {
    let ret
    if (redis.mode === 'standalone') {
      ret = await redis.conn.scan(cursor, 'match', pattern, 'count', cnt)
    } else {
      const nodes = await this.clusterNodes(redis)
      let keys = []
      const cursors = []
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type !== 'master') {
          continue
        }
        const conn = await this.getSubConn(redis, nodes[i].host, nodes[i].port)
        const tmpRet = await conn.scan(cursor, 'match', pattern, 'count', cnt)
        keys = keys.concat(tmpRet[1])
        cursors.push(tmpRet[0])
      }
      ret = [cursors, keys]
    }
    return ret
  }

  async keys(redis, pattern, cnt) {
    let ret
    if (redis.mode === 'standalone') {
      ret = await redis.conn.keys(pattern)
    } else {
      const nodes = await this.clusterNodes(redis)
      let keys = []
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].type !== 'master') {
          continue
        }
        const conn = await this.getSubConn(redis, nodes[i].host, nodes[i].port)
        const tmpRet = await conn.keys(pattern)
        keys = keys.concat(tmpRet)
      }
      ret = keys
    }
    return ret.slice(0, cnt)
  }

  /**
   * parse the redis info ret
   */
  parseInfo(infoRet, option) {
    const info = {
      keys: '0',
      raw: infoRet
    }
    const lines = infoRet.trim().split('\n')
    lines.forEach(line => {
      if (line.indexOf('#') === 0) {
        return
      }
      const i = line.indexOf(':')
      if (i > 0) {
        const key = line.substring(0, i)
        const value = line.substring(i + 1)
        info[key] = value
        if (key.indexOf(`db${option.db}`) === 0) {
          const ki = value.indexOf('keys=')
          const ci = value.indexOf(',')
          const keys = value.substring(ki + 5, ci)
          info['keys'] = keys
        }
      }
    })
    return info
  }

  /**
   * get redis info, for cluster return all nodes info
   */
  async info(redis) {
    const ret = await this.exec(redis, 'info')
    const info = this.parseInfo(ret, redis.option)
    if (redis.mode !== 'cluster') {
      return info
    }

    // get cluster nodes info
    const nodes = await this.clusterNodes(redis)
    info.clusterNodes = nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const conn = node.isMyself ? redis.conn : await this.getSubConn(redis, node.host, node.port)
      const ret = await this.connExec(redis, conn, 'info')
      node.info = this.parseInfo(ret, redis.option)
    }
    return info
  }

  /**
   * get the cluster nodes
   */
  async clusterNodes(redis) {
    if (redis.mode !== 'cluster') {
      return []
    }
    const nodes = []
    const ret = await redis.conn.cluster('nodes')
    const lines = ret.trim().split('\n')
    lines.forEach(line => {
      let isMyself = false
      const parts = line.trim().split(' ')
      const id = parts[0]
      const host = parts[1].split(':')[0]
      const port = parts[1].split(':')[1].split('@')[0]
      let type = parts[2]
      if (type.indexOf('myself,') === 0) {
        type = type.replace('myself,', '')
        isMyself = true
      }
      const replicaId = parts[3]
      const state = parts[7]
      const node = {
        isMyself: isMyself,
        id: id,
        host: host,
        port: port,
        type: type,
        replicaId: replicaId,
        state: state
      }
      if (isMyself) {
        nodes.splice(0, 0, node)
      } else {
        nodes.push(node)
      }
    })
    return nodes
  }

  /**
   * private, get the cluster sub conn
   */
  async getSubConn(redis, host, port) {
    const key = host + ':' + port
    let subConn = redis.clusterConns[key]
    if (!subConn) {
      subConn = await this.getConn({...redis.option, host: host, port: port})
      // eslint-disable-next-line require-atomic-updates
      redis.clusterConns[key] = subConn
    }
    return subConn
  }

  /**
   * private, exec the cmd by the conn
   */
  async connExec(redis, conn, fullCmd) {
    const parts = fullCmd.split(' ')
    const cmd = parts[0].toLowerCase()
    parts.splice(0, 1)

    const f = conn[cmd]
    if (!f) {
      throw new Error(`Unsupport cmd '${cmd}'!`)
    }
    let ret
    try {
      ret = await f.call(conn, ...parts)
    } catch (e) {
      const msg = e.message
      if (msg.indexOf('MOVED') === 0) {
        const key = msg.split(' ')[2]
        const host = key.split(':')[0]
        const port = key.split(':')[1]
        const subConn = await this.getSubConn(redis, host, port)
        ret = await this.connExec(redis, subConn, fullCmd)
      } else {
        throw e
      }
    }
    if (ret === null) {
      ret = 'NULL'
    }
    return ret
  }

  /**
   * exec the cmd
   */
  async exec(redis, fullCmd) {
    return await this.connExec(redis, redis.conn, fullCmd)
  }
}

export default new RedisUtil()

