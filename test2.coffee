_ = require 'lodash'

config = require './config'
utils = require './lib/utils'
GraphDB = require './graphDB'
scene = require './db/scene'
es = require './es'

DEFAULT_SCENE_NAME = 'HL_RELATION_ANALYSIS_DEFAULT_SCENE'

transformSceneResult = (se)->
  ret = _.pick se, ['_id', 'name', 'userId', 'createTime', 'updateTime', 'actived']
  ret.nodes = se.nodes.toJSON()
  _.forIn ret.nodes, (v, k)->
    ret.nodes[k] = JSON.parse v

  ret.relations = se.relations.toJSON()
  _.forIn ret.relations, (v, k)->
    ret.relations[k] = JSON.parse v

  return ret

transNeo4j2Mongo = (neoResult)->
  nodes = []
  relations = []
  for record in neoResult.records
    for field in record._fields
      for segment in field.segments
        start = segment.start
        startNode = {}
        startNode.labels = start.labels
        _.forIn start.properties, (v, k)->
          startNode[k] = v
        nodes.push startNode

        end = segment.end
        endNode = {}
        endNode.labels = end.labels
        _.forIn end.properties, (v, k)->
          endNode[k] = v
        nodes.push endNode

        r = segment.relationship
        relation = {}
        relation.id = r.identity.low + ""
        relation.nid = r.identity.low
        _.forIn r.properties, (v, k)->
          relation[k] = v
        relations.push relation
  ret = {nodes:nodes, relations:relations}
  return ret

exports.onConnect = (socket, req)->
  console.log '新的query连接'
  socket.on 'error', (err)->
    console.log err

  socket.on 'message', (message)->
    msg = JSON.parse message
    console.log JSON.stringify msg

    replyErr = (err)->
      obj = {error: err, req_id: msg.req_id}
      replyStr = JSON.stringify obj
      try
        socket.send replyStr
      catch e
        console.log e.stack

    reply = (err, total, result)->
      obj = {error: err, req_id: msg.req_id}
      if err
        return replyErr err
      nodes = {}
      relations = {}
      for record in result.records
        for field in record._fields
          for segment in field.segments
            node = {}
            node.id = segment.start.identity.low
            node.labels = segment.start.labels
            node.properties = segment.start.properties
            nodes[node.id] = node

            node = {}
            node.id = segment.end.identity.low
            node.labels = segment.end.labels
            node.properties = segment.end.properties
            nodes[node.id] = node

            relation = {}
            relation.id = segment.relationship.identity.low
            relation.type = segment.relationship.type
            relation.source = segment.relationship.start.low
            relation.target = segment.relationship.end.low
            relation.properties = segment.relationship.properties
            relations[relation.id] = relation

      obj.result = {
        total: total
        nodes: []
        relations: []
      }
      _.forIn nodes, (v, k)->
        obj.result.nodes.push v
      _.forIn relations, (v, k)->
        obj.result.relations.push v

      replyStr = JSON.stringify obj
      try
        socket.send replyStr
      catch e
        console.log e.stack

    replySceneResult = (err, result)->
      return replyErr err if err
      obj = {error: err, req_id: msg.req_id}
      obj.scene = transformSceneResult result
      replyStr = JSON.stringify obj
      try
        socket.send replyStr
      catch e
        console.log e.stack

    switch msg.type
      when 'cleanScene'
        sceneID = msg.sceneID
        scene.cleanScene sceneID, replySceneResult

      when 'deleteIsolatedNodes'
        sceneID = msg.sceneID
        scene.getScene sceneID, (err, result)->
          return replyErr err if err
          s = transformSceneResult result
          nodeIDs = []
          _.forIn s.nodes, (v, k)->
            nodeIDs.push v.id

          relationNodeIDs = []
          _.forIn s.relations, (v, k)->
            relationNodeIDs.push v.source
            relationNodeIDs.push v.target
          delNodesIDs = _.difference nodeIDs, relationNodeIDs
          scene.deleteSceneData sceneID, delNodesIDs, [], replySceneResult

      when 'deleteNodes'
        sceneID = msg.sceneID
        nodeIDs = msg.nodeIDs
        scene.getScene sceneID, (err, result)->
          return replyErr err if err
          s = transformSceneResult result
          removeRelations = []
          _.forIn s.relations, (v, k)->
            for nodeID in nodeIDs
              if v.source is nodeID or v.target is nodeID
                removeRelations.push v
          removeRelationIds = []
          for e in removeRelations
            removeRelationIds.push e.id
          scene.deleteSceneData sceneID, nodeIDs, removeRelationIds, replySceneResult

      when 'getSavedScenes'
        userID = msg.userID
        skip = if msg.from then msg.from else 0
        size = if msg.size then msg.size else 20
        scene.getScenes userID, skip, size, (err, result)->
          console.log err if err
          return replyErr err if err
          obj = {error: err, req_id: msg.req_id}
          obj.result = result
          replyStr = JSON.stringify obj
          try
            socket.send replyStr
          catch e
            console.log e.stack

      when 'openScene'
        scene.openScene msg.userID, msg.sceneID, replySceneResult

      when 'saveScene'
        sceneID = msg.sceneID
        name = msg.name
        scene.getScene msg.sceneID, (err, result)->
          console.log err if err
          return replyErr err if err

          newScene = {userId: result.userId, name: msg.name, nodes:result.nodes, relations:result.relations}
          scene.createScene newScene, replySceneResult

      when 'getNodesAllShortestPath'
        source = {id:msg.source.id, type:msg.source.type}
        target = {id:msg.target.id, type:msg.target.type}
        sceneID = msg.sceneID
        GraphDB.getNodesAllShortestPath source, target, (err, result)->
          return replyErr err if err
          trans = transNeo4j2Mongo result
          nodes = []
          relations = []
          nodes = _.concat nodes, _.uniqWith(trans.nodes, _.isEqual)
          relations = _.concat relations, _.uniqWith(trans.relations, _.isEqual)

          for e in trans.nodes
            continue if e.id is msg.source.id or e.id is msg.target.id

            node = {id:e.id, type:e.type}
            await GraphDB.getNodeOwner node, defer err, r1
            if err
              console.log err
              continue
            t1 = transNeo4j2Mongo r1
            nodes = _.concat nodes, _.uniqWith(t1.nodes, _.isEqual)
            relations = _.concat relations, _.uniqWith(t1.relations, _.isEqual)

          scene.addNodes sceneID, nodes, (err)->
            return replyErr err if err
            scene.addRelations sceneID, relations, replySceneResult

      when 'getNodesShortestPath'
        sceneID = msg.sceneID
        nodesList = msg.nodes
        degre = msg.degre
        GraphDB.getNodesShortestPath nodesList, degre, (err, result)->
          return replyErr err if err
          trans = transNeo4j2Mongo result
          nodes = []
          relations = []
          nodes = _.concat nodes, _.uniqWith(trans.nodes, _.isEqual)
          relations = _.concat relations, _.uniqWith(trans.relations, _.isEqual)

          for e in trans.nodes
            node = {id:e.id, type:e.type}
            await GraphDB.getNodeOwner node, defer err, r1
            if err
              console.log err
              continue
            t1 = transNeo4j2Mongo r1
            nodes = _.concat nodes, _.uniqWith(t1.nodes, _.isEqual)
            relations = _.concat relations, _.uniqWith(t1.relations, _.isEqual)

          scene.addNodes sceneID, nodes, (err)->
            return replyErr err if err
            scene.addRelations sceneID, relations, replySceneResult

      when 'getNodesRelations'
        source = {id:msg.source.id, type:msg.source.type}
        target = {id:msg.target.id, type:msg.target.type}
        sceneID = msg.sceneID
        GraphDB.getNodesRelationships source, target, msg.degree, (err, result)->
          return replyErr err if err
          trans = transNeo4j2Mongo result
          scene.addNodes sceneID, trans.nodes, (err)->
            return replyErr err if err
            scene.addRelations sceneID, trans.relations, replySceneResult

      when 'getNodeRelations'
        GraphDB.getNodeRelationsCount msg.id, (err, result)->
          if err
            return replyErr err

          total = result.records[0]._fields[0].low
          GraphDB.getNodeRelations msg.id, (err, result)->
            reply err, total, result

      when 'getNodeLabels'
        GraphDB.getAllLabels (err, result)->
          return replyErr err if err

          obj = {error: err, req_id: msg.req_id}
          labels = []
          for e in result.records
            labels = _.concat labels, e._fields[0]
          obj.labels = labels
          replyStr = JSON.stringify obj
          try
            socket.send replyStr
          catch e
            console.log e.stack

      when 'getRelationLabels'
        GraphDB.getAllRelationships (err, data)->
          return replyErr err if err

          obj = {error: err, req_id: msg.req_id}
          labels = []
          for e in data.records
            labels = _.concat labels, e._fields
          obj.labels = labels
          replyStr = JSON.stringify obj
          try
            socket.send replyStr
          catch e
            console.log e.stack

      when 'getActiveScene'
        await scene.getActiveScene msg.userId, defer err, result
        unless err
          replySceneResult err, result
        else
          scene.getSceneByName msg.userId, DEFAULT_SCENE_NAME, (err, result)->
            if err
              console.log '没有默认场景'
              nObj = {userId: msg.userId, name: DEFAULT_SCENE_NAME, actived:true}
              scene.createScene nObj, replySceneResult
            else
              replySceneResult err, result

      when 'addNodes2Scene'
        nodes = msg.nodes
        sceneID = msg.sceneID
        scene.addNodes sceneID, nodes, (err, result)->
          return replyErr err if err
          sceneNodes =  result.nodes.toJSON()
          queryNodes = []
          _.forIn sceneNodes, (v,k)->
            queryNodes.push JSON.parse v
          GraphDB.getNodesRelations queryNodes, (err, result)->
            return replyErr err if err
            trans = transNeo4j2Mongo result
            scene.addNodesAndRelations sceneID, trans.nodes, trans.relations, replySceneResult

      when 'addRelations2Scene'
        sceneID = msg.sceneID
        relations = msg.relations
        nodes = []

        docs = []
        for r in relations
          doc = {}
          doc.index = r.source_type
          doc.id = r.source
          docs.push doc

          docTarget = {}
          docTarget.index = r.target_type
          docTarget.id = r.target
          docs.push docTarget

        es.searchIndexIDs docs, (err, data)->
          return replyErr err if err

          for hit in data.docs
            nodes.push hit._source

          scene.addNodesAndRelations sceneID, nodes, relations, (err, result)->
            return replyErr err if err
            sceneNodes = result.nodes.toJSON()
            queryNodes = []
            _.forIn sceneNodes, (v,k)->
              queryNodes.push JSON.parse v
            GraphDB.getNodesRelations queryNodes, (err, result)->
              return replyErr err if err
              trans = transNeo4j2Mongo result
              scene.addNodesAndRelations sceneID, trans.nodes, trans.relations, replySceneResult

      when 'addGraph2Scene'
        sceneID = msg.sceneID
        nodes = msg.nodes
        relations = msg.relations

        docs = []
        for r in relations
          doc = {}
          doc.index = r.source_type
          doc.id = r.source
          docs.push doc

          docTarget = {}
          docTarget.index = r.target_type
          docTarget.id = r.target
          docs.push docTarget

        if docs.length > 0
          await es.searchIndexIDs docs, defer err, data
          return replyErr err if err
          for hit in data.docs
            nodes.push hit._source

        scene.addNodesAndRelations sceneID, nodes, relations, (err, result)->
          return replyErr err if err
          sceneNodes =  result.nodes.toJSON()
          queryNodes = []
          _.forIn sceneNodes, (v,k)->
            queryNodes.push JSON.parse v
          GraphDB.getNodesRelations queryNodes, (err, result)->
            return replyErr err if err
            trans = transNeo4j2Mongo result
            scene.addNodesAndRelations sceneID, trans.nodes, trans.relations, replySceneResult

      when 'expandNode'
        sceneID = msg.sceneID
        nodeID = msg.nodeID
        GraphDB.getNodeRelations nodeID, (err, result)->
          return replyErr err if err

          trans = transNeo4j2Mongo result
          scene.addNodes sceneID, trans.nodes, (err)->
            return replyErr err if err
            scene.addRelations sceneID, trans.relations, replySceneResult

      when 'contractNode'
        sceneID = msg.sceneID
        nodeID = msg.nodeID
        scene.getScene sceneID, (err, result)->
          return replyErr err if err
          s = transformSceneResult result
          removeRelations = []
          others = []
          _.forIn s.relations, (v, k)->
            if v.source is nodeID or v.target is nodeID
              removeRelations.push v
            else
              others.push v.source
              others.push v.target

          _.remove removeRelations, (item)->
            return _.indexOf(others, item.source)>-1 or _.indexOf(others, item.target)>-1

          removeNodeIds = []
          for e in removeRelations
            if e.source isnt nodeID
              removeNodeIds.push e.source
            if e.target isnt nodeID
              removeNodeIds.push e.target

          removeRelationIds = []
          for e in removeRelations
            removeRelationIds.push e.id
          scene.deleteSceneData sceneID, removeNodeIds, removeRelationIds, replySceneResult

      when 'statistics'
        GraphDB.getStatistics (err, result)->
          return replyErr err if err
          obj = {error: err, req_id: msg.req_id}
          obj.result = result
          replyStr = JSON.stringify obj
          try
            socket.send replyStr
          catch e
            console.log e.stack

      when 'expandOwner'
        node = {id:msg.nodeID, type:msg.nodeType}
        sceneID = msg.sceneID
        GraphDB.getNodeOwner node, (err, result)->
          return replyErr err if err

          trans = transNeo4j2Mongo result
          scene.addNodes sceneID, trans.nodes, (err)->
            return replyErr err if err
            scene.addRelations sceneID, trans.relations, replySceneResult

      when 'expandAllOwner'
        sceneID = msg.sceneID
        scene.getScene sceneID, (err, result)->
          return replyErr err if err
          s = transformSceneResult result
          nodeIDs = []
          _.forIn s.nodes, (v, k)->
            nodeIDs.push v.id
          GraphDB.getNodesOwner nodeIDs, (err, result)->
            return replyErr err if err

            trans = transNeo4j2Mongo result
            scene.addNodes sceneID, trans.nodes, (err)->
              return replyErr err if err
              scene.addRelations sceneID, trans.relations, replySceneResult

      when 'updateRecord'
        sceneID = msg.sceneID
        recordID = msg.recordID
        type = msg.recordType

        para = {}
        para.index = type
        para.id = recordID
        para.update = msg.update

        es.updateRecord para, (err, result)->
          return replyErr err if err
          GraphDB.updateRecord recordID, type, msg.update, (err, result)->
            return replyErr err if err
            scene.updateRecord sceneID, recordID, msg.update, (err, result)->
              return replyErr err if err

              obj = {error: err, req_id: msg.req_id}
              obj.result = result
              replyStr = JSON.stringify obj
              try
                socket.send replyStr
              catch e
                console.log e.stack

      when 'deleteSubGraph'
        sceneID = msg.sceneID
        nodeID = msg.nodeID # 子图的任意一个节点
        deepTraversal = (node, relations)->
          relationHitList = []
          reservedRelations = []
          _.forIn relations, (v, k)->
            reservedRelations.push v
            if v.source is node or v.target is node
              relationHitList.push v

          _.remove reservedRelations, (n)->
            for e in relationHitList
              if e.id is n.id
                return true
            return false

          return relationHitList if _.isEmpty reservedRelations

          traversal = (rRelations, hitList)->
            tmpHits = []
            for v in rRelations
              for e in hitList
                if v.id isnt e.id
                  if v.source is e.source or v.source is e.target or v.target is e.target or v.target is e.source
                    tmpHits.push v
            _.remove rRelations, (n)->
              for e in tmpHits
                if e.id is n.id
                  return true
              return false

            return hitList if _.isEmpty tmpHits

            hitList = _.concat hitList, tmpHits
            return hitList if _.isEmpty rRelations

            traversal rRelations, hitList
          relationHitList = traversal reservedRelations, relationHitList
          return relationHitList

        scene.getScene sceneID, (err, result)->
          return replyErr err if err
          s = transformSceneResult result

          hitRelations = deepTraversal nodeID, s.relations
          nodeIDs = []
          delRelationIDs = []
          for e in hitRelations
            delRelationIDs.push e.id
            nodeIDs.push e.source
            nodeIDs.push e.target

          delNodesIDs = _.uniq nodeIDs
          scene.deleteSceneData sceneID, delNodesIDs, delRelationIDs, replySceneResult

      when 'deleteScene'
        sceneID = msg.sceneID
        scene.deleteScene sceneID, (err, result)->
          return replyErr err if err
          obj = {error: err, req_id: msg.req_id}
          obj.result = result
          replyStr = JSON.stringify obj
          try
            socket.send replyStr
          catch e
            console.log e.stack

