const regeneratorRuntime = require('/utils/runtime.js')
const { patchPage, patchComponent } = require('/utils/miniprogrampatch.js')

Page = patchPage(Page)
Component = patchComponent(Component)


//app.js
App({
  onLaunch() {

  }
})