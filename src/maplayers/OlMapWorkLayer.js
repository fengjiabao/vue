/**
 * 所有交互 Layer 的基类
 */
export default class OlMapWorkLayer {
    constructor (workspace) {
      this.workspace = workspace
      this.mapID = workspace.mapID
      this.mapType = workspace.mapType
    }
  }
  