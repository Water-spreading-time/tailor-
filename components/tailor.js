const tabHeight = 50

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    avatarSrc: String,
    avatarStyle: Object,
    selWidth: String,
    selHeight: String,
    expWidth: Number,
    expHeight: Number,
    minScale: Number,
    maxScale: Number,
    canScale: Boolean,
    canRotate: Boolean,
    lockWidth: Number,
    lockHeight: Number,
    stretch: Object,
    lock: Object,
    noTab: Boolean,
    inner: Boolean,
    quality: Number,
    index: Number,
  },

  /**
   * 组件的初始数据
   */
  data: {
    cvsStyleHeight: '0px',
    styleDisplay: 'none',
    styleTop: '-10000px',
    prvTop: '-10000px',
    imgStyle: {},
    selStyle: {},
    showOper: true,
    imgSrc: {
      imgSrc: ''
    },
    btnWidth: '32%',
  },
  watch: {
    avatarSrc() {
      this.setData({
        ['imgSrc.imgSrc']: this.data.avatarSrc
      })
    }
  },
  ready:function() {
    this.data.ctxCanvas = wx.createCanvasContext('avatar-canvas', this)
    this.data.ctxCanvasOper = wx.createCanvasContext('oper-canvas', this)
    this.data.ctxCanvasPrv = wx.createCanvasContext('prv-canvas', this)
    this.data.qlty = parseInt(this.data.quality) || 0.9
    this.data.letRotate = (this.data.canRotate === 'false' || this.data.inner === 'true') ? 0 : 1
    this.data.letScale = this.data.canScale === 'false' ? 0 : 1
    this.data.isin = this.data.inner === 'true' ? 1 : 0
    this.data.indx = this.data.index || undefined
    this.data.mnScale = this.data.minScale || 0.3
    this.data.mxScale = this.data.maxScale || 4
    this.data.noBar = this.data.noTab
    this.data.stc = this.data.stretch
    this.data.lck = this.data.lock
    this.setData({
      ['imgSrc.imgSrc']: this.data.avatarSrc
    })
    if (this.data.isin) {
      this.setData({
        btnWidth:'24%'
      })
    }

    if (this.data.noBar) {
      this.data.moreHeight = 0
      this.fWindowResize()
    } else {
      wx.showTabBar({
        complete: (res) => {
          this.data.moreHeight = (res.errMsg === 'showTabBar:ok') ? 50 : 0
          this.fWindowResize()
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    fGetImgData() {
      return new Promise((resolve, reject) => {
        let prvX = this.data.prvX,
          prvY = this.data.prvY,
          prvWidth = this.data.prvWidth,
          prvHeight = this.data.prvHeight
        wx.canvasGetImageData({
          canvasId: 'prv-canvas',
          x: prvX,
          y: prvY,
          width: prvWidth,
          height: prvHeight,
          success(res) {
            resolve(res.data);
          },
          fail(err) {
            reject(err)
          }
        }, this)
      })
    },
    async fColorChange(e) {
      let tm_now = Date.now()
      if (tm_now - this.data.prvTm < 100) return
      this.data.prvTm = tm_now

      wx.showLoading({ mask: true })

      if (!this.data.prvImgData) {
        if (!(this.data.prvImgData = await this.fGetImgData().catch((res) => {
          wx.showToast({
            title: "error_read",
            duration: 2000,
          })
        }))) return
        this.data.target = new Uint8ClampedArray(this.data.prvImgData.length);
      }

      let data = this.data.prvImgData,
        target = this.data.target,
        i = e.detail.value,
        r, g, b, a, h, s, l, d, p, q, t, min, max, hK, tR, tG, tB;

      if (i === 0) {
        target = data
      } else {
        i = (i + 100) / 200
        if (i < 0.005) i = 0
        if (i > 0.995) i = 1
        for (let n = data.length - 1; n >= 0; n -= 4) {
          r = data[n - 3] / 255
          g = data[n - 2] / 255
          b = data[n - 1] / 255
          max = Math.max(r, g, b)
          min = Math.min(r, g, b)
          d = max - min
          if (max === min) {
            h = 0
          } else if (max === r && g >= b) {
            h = 60 * ((g - b) / d)
          } else if (max === r && g < b) {
            h = 60 * ((g - b) / d) + 360
          } else if (max === g) {
            h = 60 * ((b - r) / d) + 120
          } else if (max === b) {
            h = 60 * ((r - g) / d) + 240
          }
          l = (max + min) / 2
          if (l === 0 || max === min) {
            s = 0
          } else if (0 < l && l <= 0.5) {
            s = d / (2 * l)
          } else if (l > 0.5) {
            s = d / (2 - 2 * l)
          }
          data[n] && (a = data[n])

          if (i < 0.5) {
            s = s * i / 0.5
          } else if (i > 0.5) {
            s = 2 * s + 2 * i - (s * i / 0.5) - 1
          }

          if (s === 0) {
            r = g = b = Math.round(l * 255)
          } else {
            if (l < 0.5) {
              q = l * (1 + s)
            } else if (l >= 0.5) {
              q = l + s - (l * s)
            }
            p = 2 * l - q
            hK = h / 360
            tR = hK + 1 / 3
            tG = hK
            tB = hK - 1 / 3
            let correctRGB = (t) => {
              if (t < 0) {
                return t + 1.0
              }
              if (t > 1) {
                return t - 1.0
              }
              return t
            }
            let createRGB = (t) => {
              if (t < (1 / 6)) {
                return p + ((q - p) * 6 * t)
              } else if (t >= (1 / 6) && t < (1 / 2)) {
                return q
              } else if (t >= (1 / 2) && t < (2 / 3)) {
                return p + ((q - p) * 6 * ((2 / 3) - t))
              }
              return p
            }
            r = tR = Math.round(createRGB(correctRGB(tR)) * 255)
            g = tG = Math.round(createRGB(correctRGB(tG)) * 255)
            b = tB = Math.round(createRGB(correctRGB(tB)) * 255)
          }
          a && (target[n] = a)
          target[n - 3] = r
          target[n - 2] = g
          target[n - 1] = b
        }
      }
      let prvX = this.data.prvX,
        prvY = this.data.prvY,
        prvWidth = this.data.prvWidth,
        prvHeight = this.data.prvHeight

      this.data.ctxCanvasPrv.setFillStyle('black')
      this.data.ctxCanvasPrv.fillRect(prvX, prvY, prvWidth, prvHeight)
      this.data.ctxCanvasPrv.draw(true)
      wx.canvasPutImageData({
        canvasId: 'prv-canvas',
        x: prvX,
        y: prvY,
        width: prvWidth,
        height: prvHeight,
        data: target,
        fail() {
          wx.showToast({
            title: 'error_put',
            duration: 2000
          })
        },
        complete() {
          wx.hideLoading()
        }
      }, this)
    },
    fWindowResize() {
      let sysInfo = wx.getSystemInfoSync()
      this.data.platform = sysInfo.platform
      this.data.pixelRatio = sysInfo.pixelRatio
      this.data.windowWidth = sysInfo.windowWidth
      this.data.windowHeight = sysInfo.windowHeight + this.data.moreHeight
      this.data.pxRatio = this.data.windowWidth / 750
      this.setData({
        cvsStyleHeight: this.data.windowHeight - tabHeight - 2 + 'px'
      })

      let style = this.data.avatarStyle
      if (style && style !== true && (style = style.trim())) {
        style = style.split(';')
        let obj = {}
        for (let v of style) {
          if (!v) continue
          v = v.trim().split(':')
          if (v[1].indexOf('upx') >= 0) {
            let arr = v[1].trim().split(' ')
            for (let k in arr) {
              if (!arr[k]) continue
              if (arr[k].indexOf('upx') >= 0) {
                arr[k] = parseFloat(arr[k]) * this.data.pxRatio + 'px'
              }
            }
            v[1] = arr.join(' ')
          }
          obj[v[0].trim()] = v[1].trim()
        }
        this.setData({
          imgStyle:obj
        })
      }

      this.data.expWidth && (this.data.exportWidth = this.data.expWidth.indexOf('upx') >= 0 ? parseInt(this.data.expWidth) * this.data.pxRatio : parseInt(this.data.expWidth))
      this.data.expHeight && (this.data.exportHeight = this.data.expHeight.indexOf('upx') >= 0 ? parseInt(this.data.expHeight) * this.data.pxRatio : parseInt(this.data.expHeight))

      if (this.data.styleDisplay === 'flex') {
        this.fDrawInit(true)
      }
      this.fHideImg()
    },
    fSelect() {
      if (this.data.fSelecting) return
      this.data.fSelecting = true
      setTimeout(() => { this.data.fSelecting = false; }, 500)

      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (r) => {
          wx.showLoading({ mask: true })
          let path = this.data.imgPath = r.tempFilePaths[0]
          wx.getImageInfo({
            src: path,
            success: r => {
              this.data.imgWidth = r.width
              this.data.imgHeight = r.height
              this.data.path = path
              if (!this.data.hasSel) {
                let style = this.data.selStyle || {}
                if (this.data.selWidth && this.data.selHeight) {
                  let selWidth = this.data.selWidth.indexOf('rpx') >= 0 ? parseInt(this.data.selWidth) * this.data.pxRatio : parseInt(this.data.selWidth),
                    selHeight = this.data.selHeight.indexOf('rpx') >= 0 ? parseInt(this.data.selHeight) * this.data.pxRatio : parseInt(this.data.selHeight)
                  style.width = selWidth + 'px'
                  style.height = selHeight + 'px'
                  style.top = (this.data.windowHeight - selHeight - tabHeight) / 2 + 'px'
                  style.left = (this.data.windowWidth - selWidth) / 2 + 'px'
                } else {
                  wx.showModal({
                    title: '裁剪框的宽或高没有设置',
                    showCancel: false
                  })
                  return
                }
                this.data.selStyle = style
              }

              if (this.data.noBar) {
                this.fDrawInit(true)
              } else {
                wx.hideTabBar({
                  complete: () => {
                    this.fDrawInit(true)
                  }
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: "error3",
                duration: 2000,
              })
            },
            complete() {
              wx.hideLoading()
            }
          })
        }
      })
    },
    fUpload() {
      if (this.data.fUploading) return
      this.data.fUploading = true
      setTimeout(() => { this.data.fUploading = false; }, 1000)

      let style = this.data.selStyle,
        x = parseInt(style.left),
        y = parseInt(style.top),
        width = parseInt(style.width),
        height = parseInt(style.height),
        expWidth = this.data.exportWidth || width,
        expHeight = this.data.exportHeight || height

      wx.showLoading({ mask: true })
      this.setData({
        styleDisplay:'none',
        styleTop:'-10000px'
      })
      this.data.hasSel = false
      this.fHideImg()
      wx.canvasToTempFilePath({
        x: x,
        y: y,
        width: width,
        height: height,
        destWidth: expWidth,
        destHeight: expHeight,
        canvasId: 'avatar-canvas',
        fileType: 'png',
        quality: this.data.qlty,
        success: (r) => {
          r = r.tempFilePath
          this.triggerEvent("upload", { avatar: this.data.imgSrc, path: r, index: this.data.indx, data: this.data.rtn })
        },
        fail: (res) => {
          wx.showToast({
            title: "error1",
            duration: 2000,
          })
        },
        complete: () => {
          wx.hideLoading()
          this.data.noBar || wx.showTabBar()
        }
      }, this)
    },
    // fPrvUpload() {
    //   if (this.fPrvUploading) return;
    //   this.fPrvUploading = true;
    //   setTimeout(() => { this.fPrvUploading = false; }, 1000)

    //   let style = this.selStyle,
    //     destWidth = parseInt(style.width),
    //     destHeight = parseInt(style.height),
    //     prvX = this.prvX,
    //     prvY = this.prvY,
    //     prvWidth = this.prvWidth,
    //     prvHeight = this.prvHeight,
    //     expWidth = this.exportWidth || prvWidth,
    //     expHeight = this.exportHeight || prvHeight;

    //   uni.showLoading({ mask: true });

    //   this.styleDisplay = 'none';
    //   this.styleTop = '-10000px';
    //   this.hasSel = false;
    //   this.fHideImg();
    //   uni.canvasToTempFilePath({
    //     x: prvX,
    //     y: prvY,
    //     width: prvWidth,
    //     height: prvHeight,
    //     destWidth: expWidth,
    //     destHeight: expHeight,
    //     canvasId: 'prv-canvas',
    //     fileType: 'png',
    //     quality: this.qlty,
    //     success: (r) => {
    //       r = r.tempFilePath;
    //     },
    //     fail: () => {
    //       uni.showToast({
    //         title: "error_prv",
    //         duration: 2000,
    //       })
    //     },
    //     complete: () => {
    //       uni.hideLoading();
    //       this.noBar || uni.showTabBar();
    //     }
    //   }, this);
    // },
    fDrawImage() {
      let tm_now = Date.now()
      if (tm_now - this.data.drawTm < 20) return
      this.data.drawTm = tm_now
      let ctxCanvas = this.data.ctxCanvas
      ctxCanvas.fillRect(0, 0, this.data.windowWidth, this.data.windowHeight - tabHeight)
      ctxCanvas.translate(this.data.posWidth + this.data.useWidth / 2, this.data.posHeight + this.data.useHeight / 2)
      ctxCanvas.scale(this.data.scaleSize, this.data.scaleSize)
      ctxCanvas.rotate(this.data.rotateDeg * Math.PI / 180)
      ctxCanvas.drawImage(this.data.imgPath, -this.data.useWidth / 2, -this.data.useHeight / 2, this.data.useWidth, this.data.useHeight)
      ctxCanvas.draw(false)
    },
    fHideImg() {
      this.setData({
        prvTop:'-10000px'
      })
      this.data.prvImg = ''
      this.data.showOper = true
      this.data.prvImgData = null
      this.data.target = null
    },
    fClose() {
      this.setData({
        styleDisplay:'none',
        styleTop:'-10000px'
      })
      this.data.hasSel = false
      this.fHideImg()
      this.data.noBar || wx.showTabBar()
    },
    // fPreview() {
    //   if (this.fPreviewing) return;
    //   this.fPreviewing = true;
    //   setTimeout(() => { this.fPreviewing = false; }, 1000);

    //   let style = this.selStyle,
    //     x = parseInt(style.left),
    //     y = parseInt(style.top),
    //     width = parseInt(style.width),
    //     height = parseInt(style.height);

    //   uni.showLoading({ mask: true });

    //   uni.canvasToTempFilePath({
    //     x: x,
    //     y: y,
    //     width: width,
    //     height: height,
    //     canvasId: 'avatar-canvas',
    //     fileType: 'png',
    //     quality: this.qlty,
    //     success: (r) => {
    //       this.prvImgTmp = r = r.tempFilePath;

    //       let ctxCanvasPrv = this.ctxCanvasPrv,
    //         prvX = this.windowWidth,
    //         prvY = parseInt(this.cvsStyleHeight),
    //         prvWidth = parseInt(this.selStyle.width),
    //         prvHeight = parseInt(this.selStyle.height),
    //         useWidth = prvX - 40,
    //         useHeight = prvY - 80,
    //         radio = useWidth / prvWidth,
    //         rHeight = prvHeight * radio;
    //       if (rHeight < useHeight) {
    //         prvWidth = useWidth;
    //         prvHeight = rHeight;
    //       } else {
    //         radio = useHeight / prvHeight;
    //         prvWidth *= radio;
    //         prvHeight = useHeight;
    //       }
    //       ctxCanvasPrv.setFillStyle('black');
    //       ctxCanvasPrv.fillRect(0, 0, prvX, prvY);
    //       this.prvX = prvX = (prvX - prvWidth) / 2;
    //       this.prvY = prvY = (prvY - prvHeight) / 2;
    //       this.prvWidth = prvWidth;
    //       this.prvHeight = prvHeight;
    //       ctxCanvasPrv.drawImage(r, prvX, prvY, prvWidth, prvHeight);
    //       ctxCanvasPrv.draw(false);
    //     },
    //     fail: () => {
    //       uni.showToast({
    //         title: "error2",
    //         duration: 2000,
    //       })
    //     },
    //     complete: () => {
    //       uni.hideLoading();
    //     }
    //   }, this);
    // },
    fDrawInit(ini = false) {
      let allWidth = this.data.windowWidth,
        allHeight = this.data.windowHeight,
        imgWidth = this.data.imgWidth,
        imgHeight = this.data.imgHeight,
        imgRadio = imgWidth / imgHeight,
        useWidth = allWidth - 40,
        useHeight = allHeight - tabHeight - 80,
        pixelRatio = this.data.pixelRatio,
        selWidth = parseInt(this.data.selStyle.width),
        selHeight = parseInt(this.data.selStyle.height)

      this.data.fixWidth = 0
      this.data.fixHeight = 0
      this.data.lckWidth = 0
      this.data.lckHeight = 0
      switch (this.data.stc) {
        case 'x': this.data.fixWidth = 1; break;
        case 'y': this.data.fixHeight = 1; break;
        case 'long': if (imgRadio > 1) this.data.fixWidth = 1; else this.data.fixHeight = 1; break;
        case 'short': if (imgRadio > 1) this.data.fixHeight = 1; else this.data.fixWidth = 1; break;
        case 'longSel': if (selWidth > selHeight) this.data.fixWidth = 1; else this.data.fixHeight = 1; break;
        case 'shortSel': if (selWidth > selHeight) this.data.fixHeight = 1; else this.data.fixWidth = 1; break;
      }
      switch (this.data.lck) {
        case 'x': this.data.lckWidth = 1; break;
        case 'y': this.data.lckHeight = 1; break;
        case 'long': if (imgRadio > 1) this.data.lckWidth = 1; else this.data.lckHeight = 1; break;
        case 'short': if (imgRadio > 1) this.data.lckHeight = 1; else this.data.lckWidth = 1; break;
        case 'longSel': if (selWidth > selHeight) this.data.lckWidth = 1; else this.data.lckHeight = 1; break;
        case 'shortSel': if (selWidth > selHeight) this.data.lckHeight = 1; else this.data.lckWidth = 1; break;
      }
      if (this.data.fixWidth) {
        useWidth = selWidth
        useHeight = useWidth / imgRadio
      } else if (this.data.fixHeight) {
        useHeight = selHeight
        useWidth = useHeight * imgRadio
      } else if (imgRadio < 1) {
        if (imgHeight < useHeight) {
          useWidth = imgWidth
          useHeight = imgHeight
        } else {
          useHeight = useHeight
          useWidth = useHeight * imgRadio
        }
      } else {
        if (imgWidth < useWidth) {
          useWidth = imgWidth
          useHeight = imgHeight
        } else {
          useWidth = useWidth
          useHeight = useWidth / imgRadio
        }
      }
      if (this.data.isin) {
        this.data.scaleWidth = 0
        this.data.scaleHeight = 0
        if (useWidth < selWidth) {
          useWidth = selWidth
          useHeight = useWidth / imgRadio
          this.data.lckHeight = 0
        }
        if (useHeight < selHeight) {
          useHeight = selHeight
          useWidth = useHeight * imgRadio
          this.data.lckWidth = 0
        }
      }

      this.data.scaleSize = 1
      this.data.rotateDeg = 0
      this.data.posWidth = (allWidth - useWidth) / 2
      this.data.posHeight = (allHeight - useHeight - tabHeight) / 2
      this.data.useWidth = useWidth
      this.data.useHeight = useHeight

      let style = this.data.selStyle,
        left = parseInt(style.left),
        top = parseInt(style.top),
        width = parseInt(style.width),
        height = parseInt(style.height),
        canvas = this.data.canvas,
        canvasOper = this.data.canvasOper,
        ctxCanvas = this.data.ctxCanvas,
        ctxCanvasOper = this.data.ctxCanvasOper
      ctxCanvasOper.setLineWidth(3)
      ctxCanvasOper.setStrokeStyle('grey')
      ctxCanvasOper.setGlobalAlpha(0.4)
      ctxCanvasOper.setFillStyle('black')
      ctxCanvasOper.strokeRect(left, top, width, height)
      ctxCanvasOper.fillRect(0, 0, this.data.windowWidth, top)
      ctxCanvasOper.fillRect(0, top, left, height)
      ctxCanvasOper.fillRect(0, top + height, this.data.windowWidth, this.data.windowHeight - height - top - tabHeight)
      ctxCanvasOper.fillRect(left + width, top, this.data.windowWidth - width - left, height)
      ctxCanvasOper.setStrokeStyle('red')
      ctxCanvasOper.moveTo(left + 20, top); ctxCanvasOper.lineTo(left, top); ctxCanvasOper.lineTo(left, top + 20);
      ctxCanvasOper.moveTo(left + width - 20, top); ctxCanvasOper.lineTo(left + width, top); ctxCanvasOper.lineTo(left + width, top + 20)
      ctxCanvasOper.moveTo(left + 20, top + height); ctxCanvasOper.lineTo(left, top + height); ctxCanvasOper.lineTo(left, top + height - 20)
      ctxCanvasOper.moveTo(left + width - 20, top + height); ctxCanvasOper.lineTo(left + width, top + height); ctxCanvasOper.lineTo(left + width, top + height - 20)
      ctxCanvasOper.stroke()

      ctxCanvasOper.draw(false, () => {
        if (ini) {
          this.setData({
            styleTop : '0',
            styleDisplay:'flex'
          })
          ctxCanvas.setFillStyle('black')
          this.fDrawImage()
        }
      })

      this.triggerEvent("avtinit")
    },
    fChooseImg(index = undefined, params = undefined, data = undefined) {
      if (params) {
        let selWidth = params.selWidth,
          selHeight = params.selHeight,
          expWidth = params.expWidth,
          expHeight = params.expHeight,
          quality = params.quality,
          canRotate = params.canRotate,
          canScale = params.canScale,
          minScale = params.minScale,
          maxScale = params.maxScale,
          stretch = params.stretch,
          lock = params.lock

        expWidth && (this.data.exportWidth = expWidth.indexOf('upx') >= 0 ? parseInt(expWidth) * this.pxRatio : parseInt(expWidth))
        expHeight && (this.data.exportHeight = expHeight.indexOf('upx') >= 0 ? parseInt(expHeight) * this.pxRatio : parseInt(expHeight))
        this.data.letRotate = canRotate === 'false' ? 0 : 1
        this.data.letScale = canScale === 'false' ? 0 : 1
        this.data.qlty = parseInt(quality) || 0.9
        this.data.mnScale = minScale || 0.3
        this.data.mxScale = maxScale || 4
        this.data.stc = stretch
        this.data.lck = lock

        if (selWidth && selHeight) {
          selWidth = selWidth.indexOf('upx') >= 0 ? parseInt(selWidth) * this.data.pxRatio : parseInt(selWidth)
          selHeight = selHeight.indexOf('upx') >= 0 ? parseInt(selHeight) * this.data.pxRatio : parseInt(selHeight)
          this.data.selStyle.width = selWidth + 'px'
          this.data.selStyle.height = selHeight + 'px'
          this.data.selStyle.top = (this.data.windowHeight - selHeight - tabHeight) / 2 + 'px'
          this.data.selStyle.left = (this.data.windowWidth - selWidth) / 2 + 'px'
          this.data.hasSel = true
        }
      }
      this.data.rtn = data
      this.data.indx = index
      this.fSelect()
    },
    // fRotate() {
    //   // if(this.letRotate) {
    //   this.rotateDeg += 90 - this.rotateDeg % 90;
    //   this.fDrawImage();
    //   // }
    // },
    fStart(e) {
      let touches = e.touches,
        touch0 = touches[0],
        touch1 = touches[1]

      this.data.touch0 = touch0
      this.data.touch1 = touch1

      if (touch1) {
        let x = touch1.x - touch0.x,
          y = touch1.y - touch0.y
        this.data.fgDistance = Math.sqrt(x * x + y * y)
      }
    },
    fMove(e) {
      let touches = e.touches,
        touch0 = touches[0],
        touch1 = touches[1]

      if (touch1) {
        let x = touch1.x - touch0.x,
          y = touch1.y - touch0.y,
          fgDistance = Math.sqrt(x * x + y * y),
          scaleSize = 0.005 * (fgDistance - this.data.fgDistance),
          beScaleSize = this.data.scaleSize + scaleSize

        do {
          if (!this.data.letScale) break
          if (beScaleSize < this.data.mnScale) break
          if (beScaleSize > this.data.mxScale) break
          if (this.data.isin) {
            let imgWidth = this.data.useWidth * beScaleSize,
              imgHeight = this.data.useHeight * beScaleSize,
              rx0 = this.data.posWidth + this.data.useWidth / 2,
              ry0 = this.data.posHeight + this.data.useHeight / 2,
              l = rx0 - imgWidth / 2, t = ry0 - imgHeight / 2,
              r = l + imgWidth, b = t + imgHeight,
              left = parseInt(this.data.selStyle.left),
              top = parseInt(this.data.selStyle.top),
              width = parseInt(this.data.selStyle.width),
              height = parseInt(this.data.selStyle.height)
            if (left < l || left + width > r || top < t || top + height > b) break
            this.data.scaleWidth = (this.data.useWidth - imgWidth) / 2
            this.data.scaleHeight = (this.data.useHeight - imgHeight) / 2
          }

          this.data.scaleSize = beScaleSize
        } while (0)
        this.data.fgDistance = fgDistance

        if (touch1.x !== touch0.x && this.data.letRotate) {
          x = (this.data.touch1.y - this.data.touch0.y) / (this.data.touch1.x - this.data.touch0.x)
          y = (touch1.y - touch0.y) / (touch1.x - touch0.x)
          this.data.rotateDeg += Math.atan((y - x) / (1 + x * y)) * 180 / Math.PI
          this.data.touch0 = touch0
          this.data.touch1 = touch1
        }

        this.fDrawImage()
      } else if (touch0) {
        let x = touch0.x - this.data.touch0.x,
          y = touch0.y - this.data.touch0.y,
          beX = this.data.posWidth + x,
          beY = this.data.posHeight + y
        if (this.data.isin) {
          let imgWidth = this.data.useWidth * this.data.scaleSize,
            imgHeight = this.data.useHeight * this.data.scaleSize,
            rx0 = beX + this.data.useWidth / 2,
            ry0 = beY + this.data.useHeight / 2,
            l = rx0 - imgWidth / 2, t = ry0 - imgHeight / 2,
            r = l + imgWidth, b = t + imgHeight,
            left = parseInt(this.data.selStyle.left),
            top = parseInt(this.data.selStyle.top),
            width = parseInt(this.data.selStyle.width),
            height = parseInt(this.data.selStyle.height)
          if (!this.data.lckWidth && Math.abs(x) < 100) {
            if (left >= l && left + width <= r) {
              this.data.posWidth = beX
            } else if (left < l) {
              this.data.posWidth = left - this.data.scaleWidth
            } else if (left + width > r) {
              this.data.posWidth = left - (imgWidth - width) - this.data.scaleWidth
            }
          }
          if (!this.data.lckHeight && Math.abs(y) < 100) {
            if (top >= t && top + height <= b) {
              this.data.posHeight = beY
            } else if (top < t) {
              this.data.posHeight = top - this.data.scaleHeight
            } else if (top + height > b) {
              this.data.posHeight = top - (imgHeight - height) - this.data.scaleHeight
            }
          }
        } else {
          if (Math.abs(x) < 100 && !this.data.lckWidth) this.data.posWidth = beX
          if (Math.abs(y) < 100 && !this.data.lckHeight) this.data.posHeight = beY
        }

        this.data.touch0 = touch0
        this.fDrawImage()
      }
    },
    fEnd(e) {
      let touches = e.touches,
        touch0 = touches && touches[0],
        touch1 = touches && touches[1]
      if (touch0) {
        this.data.touch0 = touch0
      } else {
        this.data.touch0 = null
        this.data.touch1 = null
      }
    },
    btop(base64) {
      return new Promise(function (resolve, reject) {
        var arr = base64.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return resolve((window.URL || window.webkitURL).createObjectURL(new Blob([u8arr], { type: mime })))
      })
    },
  }
})
