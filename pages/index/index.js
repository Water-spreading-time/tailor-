Page({
  data: {
    img:''
  },
  myUpload(rep) {
    this.setData({
      img: rep.detail.path
    })
  },
  //选取图片
  upload(){
    this.selectComponent('#tailor').fSelect()
  },
})
