///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
    'dojo/_base/html',
    'dojo/query',
    'dojo/on',
    'dijit/TitlePane', //MJM - collapsible bar to hold details	
    'jimu/PanelManager', //MJM - use to close another panel	
    'dojo/_base/lang',
    './common',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/utils',
    'jimu/BaseWidget'
  ],
  function(declare, html, query, on,
    TitlePane, PanelManager,
    lang, common, _WidgetsInTemplateMixin, jimuUtils, BaseWidget) {
    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-about',

      postCreate: function() {
        this.inherited(arguments);
        //MJM - Add details in collapsible panels	
        var tpContent = "<div>";
        tpContent += "<p><img id='img_1449863890283' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARRSURBVEhL7ZTrUxNnFMb7d7FBAYEIRCEGoQkhJGvu180N0MaC6MBYBAJUR5CigNSiMAhabsplIleRShBQRJSKKZiLlw90KLSkT7I2ECDEdsZvnTmzs/POeX979jnPOV9xJeYvFP+jd8TnoqWUTpejVhm1Up2OVOn5cuOOhN0RHs2TGsvKRTMPDzufx/z6JG5mLGF84MhAZ0pbc2pjA+9ylaDEKvr2rExj0nAlpu0Xw6JNlZXC9y+jvB7C6/YHXv6JTWfE6tKB/i72xYtZDXW84lISdQTuhkGbLcql6bgtrisoNt4y7ramirUUMkmNvv4qLzdPGbi7HzpDamxrTtt0EWtvIhen4j6+itpYYXidfi6e7oiJQZaM0gbycyyKqsuZAVn2Q6Nvr6djve+Il/b4U/nykjLy9ZPYQMkfFw8WfSemM8Uaii8zkmqq5gof7/ThfuiKSuGagwEdeu6whUp9tkWBTvpkQckeYrj3KA79TSbto0nQOktpuHRJoDGjn77r+6Gbf0rfdEVAhGu1GXy5wVouWnNE0iWvLzOqq/DvZku+bPnpIe97wrMQlXtaXvG90JCroq+HRGcqDAPdKahudSmyuITEyfU6Hr7kV5l4txB1Mk/Bk5hab/ma4XVF/OFgwCflFULjqXBoUkNN2Fh/uYi5R0wILZAbGuu5fzoZvqo9BETH+Ei01OzDw7REG8tETTW/zCrSnwyHRjfsw4nu+ei25uNTIwm2npTWm2mPB5No9OwYE/OpNat/gxp+U/7uiETJpVaRxqSmCaHRWmp6LGH5WYytJxk+834g+jrYTY1f+0AeYsKWRKooWAgJNNqzEG0pkBWXnhBrdTQhJFqi1WGmUdRAVwqmDriuds4NoP1zONJ3VKDUKwxa+J0+Gbex8BPoCqaBJoREYw1NjyY4Zg/1dbJpdHf7sVs30gPoLJVBoDB0t3M23RGeF9HwuNqsKSiUBgh7o+FWjBkkhrEeQBAYw0Pc//lYS1MaLchYP4tU65GJSq/Xc4uKxTypqaBQAokCkBBoiUmio6aGE1bmYjpucz68OghvoEBf1X70aP8RocqHDsQJNVV8gcRABk7CtHF9hfHgXjIsdaU6s6GO+3yCSaMxipi9bfkmTIrPduKtvRoSLVLpa3/gt7ccv3eXTeWosCJQ8vrbT74e8k/5Vr7YJMCXpKH3NVqHzuAFeeeKxC1N6dgMmLH8c1JdthreqqrKvPlj+sLjeN8CCRZkdwShJwcTr9Zm5J2VwctQGQsPT+d8jGs++s1MrH0kEb5WmzSdtzmTQ0nb1+meEYSe/4UJ3PgAC56bm2A+e8R0L0T3drBhcEwNhK6tyeho4yzaY19Mxn+TL9t+d3cEoU+fkdVd499pScVigvMwL6uOA0O9ydhnrU1p8Bl6W3heXGolsy1KWrp9Yu82okWYNOyw8xfEZVZSrv/Ug38Ve6N3BDqGidhxGDY+C/3f4ouhJea/AUfj+m6psEgNAAAAAElFTkSuQmCC'>&nbsp; <b>Measure</b><i> - </i>Propose a new RPZ.</p>";
        tpContent += "<p><img id='img_1450122900522' src='data:image/gif;base64,R0lGODlhHgAeAPQAAFxmdKSORIR+VPS6DHx6XGxyZLSWPNyuHPy+DMSiLPzCBOy2FGRqbJSGTJyGTNSqJMymJKSSRHRyZNSmJPS+DOSyHLyeNLSaNJyKRGxubAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAHgAeAAAI4AABCBxIsKDBgwgTKlzIsCHBAA4dClBAQCADCxEsYNSYcaNHiAYPKEggkIACBQhOKlig8iRLlwYFpFwgAAADAQ5w4sSgM6cDnzULWoBwAALIiEiTKl3KtGlSBzwxVHQqcIDKASUJaN3KtetUgi0XAJAAoazZs2aLljVoFWaBA3CJEo1btOiEogbDCpTAQEIBv34Z/P3blwGDmECpKl7MuDFTBgkOXDisOIHVARAZYNjMubNnDA7YqhQrYYDp06hTmzYI4eQAkgUCXMCQAMPs2rdt08ZgkAGEARAoOx5OnGpAADs='>&nbsp; <b>Legend </b>- View&nbsp;visible map layers.</p>";
        tpContent += "<p><img id='img_1450111120740' src='data:image/gif;base64,R0lGODlhHgAeAPcAAFxmdLSaNIR+VPzCBKySPMSeNJSGTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAeAB4ABwiqAAEIHEiwoMGDCBMqXMiwocABECNKLCCQgMSLAwxilBig4saIGj8OoAjAgMiMBU92BGBRZMiPJFt+fLlxpUmXKUXGPEkT40qZG3teJHlzZk6YHnESJMA0QFMCBQgYECgAKtOoBJwScMi1q9elTMOKFUBVrNmtRzfuVDpQpcCiQdNiXGuUoFuWPOUOfZvXrsiffdvqTFpX8EebgR8OxstW8WHCcb9Knky5YUAAOw=='>&nbsp; <b>Basemap Gallery</b>&nbsp;- Change background map.&nbsp;</p>";
        tpContent += "<p><img id='img_1467829434645' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAABKNJREFUSEu1letTGlcYh/vnkUltzTQbarRgVJa7N0TwigpGQxUN0TjYZOoVjVVsExRRSxWDQQ1eIiii6FgQtIiAsMi64nZRQFzSjNWWeT4xv3327HnPed+vCAD4P5GsphEARgqJA4BlmbkCsLCGUSxkYnCraQWVOSweOSf3YTr9awC8h38QT7KaRQC4JL6stH1Mrp6fWjAtm7dWzZZV4+r8h1n18JvuZhGPXfgIAO/jH8SToCYyCBnFafkSTsNAq0KvMuya7UeHx8EQcgojcCgE+T0uh9Vk0o2/7X4tEQpZVDbx8ZUomQR1Wj4BbOLINModaPcYQaO/MIqeImj4FEXPo/+gocMNq17xqobPzroSJRNXFz2iSio7tIqPNszrC3j9ru3Nec3Yr0NSWVezrLulU9GpWtKYnHbozBfw+BzrxqmhTkl9NgB+l6BLJKYm1T0RDA8t7Vu9MIpAbtuaUaccbBOXc4ouA9+Qi0gVHSK5btTktBxC0AkEuzcMI731FDAr/UqXSExd2k3vX1/YC/ghD+re0A13Pa8sZdLzgB/ol4F73zNSyFxiniSnVtH7ftviPQucHDtW1NoWsCTvSpdIVJ0pHWmYO9o5hoMui2ext7NRAJLBVOK1aITHHEJWLbdrtn894IROA/ZFx2R9vSD6ZTii6tq+ac3euQdGPJt/rPWA1dxrITyiIeao3eQOIcd2dGdS2vgMH7gAU3MJwI/S4eUlD+JHvHt6lYYL8r5YegKtk9ps/GAL+E5c6KFhUNrMBMAHuMyFWkAAetqVFksQDob3dyZ+UwBgQVLuOjIKb06z5fsL8aD+9d9bW6oBkIjP3FENu1GvceyFtBwAAXzmsxtSdNMN8UIHYYe+r0kCAmAqLnPHMsLeP+ENVZO4Dh+4IKp+knj4DDc9fH6bwa6uq6vg4GMXRNWEsuQrU8Kk4a5METGvMVs01DsTuTJQyO/4pJ5qAflfvjIEcvJFfzf4EnfRfxbJ348YnRYXFAwFw16rQdVfRQHJGVe6RGLqi/YkwNqTId6erJY5rD0NPpd1Nsm6XkTa06LG6LRh7QlGEBg699vMs5OvhOLqimp6IY+YwUhJ8GLE1f+mqYZgKBgMh+HggW1/bkqrftP+uplNLcCdvwR1fBQ0/vLyn0bB1urajHKgb7itd1xl2l9zeoMHDodtc3VFN97f3iAox+zxtSeoo8QG2E+RATb90bRithojA8y4oJ8dV8i7G8rZTD7AlpSNmFW7JxefEkaCbp91RjPQzmfmk0iMy8mZrI6NXWpk7FI5NcxiESsydmvohZUUVjE5m/UgnXmfLgTkBtmaF9uoMHp+Hj7F7A6z7sNQ09MS3uXkTFbfjEweQdhf+W5l+eDEFTzD7NgrQj770daUSt72lM/D1n5bNcDA9o0ilEvnXJg9VuRIzY+2pvWK5hJWwa3V2L6xHtJqQVFf69iq1hZwh+Jr396dV/ZzSm+tviRSc1A8KJncMOwdY7PhHD2DA7a9xQllUfkd1ZGap2ZVZVd1SSY2tDbPKep3fhrTdtTxabl3VF/C/jZLQBHLn8lH306oe2QSMT8vjUT7T9SfAwD/BlBTXOusJ93+AAAAAElFTkSuQmCC'>&nbsp; <b>Search</b> - Find address, parcel,&nbsp;or place name.</p>";
        tpContent += "<p><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAeCAIAAABbkFLLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEzSURBVEhL3ZbNaoQwFIXn/R+j6M69K8EfVIRAi4/QlYhCxT5AT5LTksw4MWHiph8MenNzPjWZRW5CiDzP36ICIbTgVlUVx6ICrbRnWcaBqEAr7WmaciAq0Eo7qwsIs78rWHgQYO/7/luBGw6d4Wv/U2s8H+Blb9uWVgMMolXX9TAMXdfpmXec2w/VGqinacLNvu+cbXNib5pGi9wsy8KAjcteliXTZwTb/dUgzF4UBXN+bNuGCMMGB3bHNrrR/yKTA/uHAq/DkAeYrFNU/PJ03bGUjHoQvKv/yI7y0+Cxy5iNr/1ux1CyoXjVPo4jGwqUbCiC7eu6Mqpw2zGZDZun9nmevwweV4YNBSazYSPtSZKwigq00n7tiePa0xJ+F5709AWPwre8uAeIQ6LfWkP7JQjxAw/p6TFTOR+fAAAAAElFTkSuQmCC'>&nbsp; <b>Default extent </b>-&nbsp;Zoom map to Tacoma.</p>";
        tpContent += "<p><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAfCAIAAAAJNFjbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAG2SURBVEhLxZbLbsIwEEX7/58RYAHKJgoPdQEI2ALiF6BUaiWWSEiAaA+eC6XBIWnB4qw845m5tpNM/DIOzI/AYDCI47hWq0V3QDpFKKWiZ4FOp6OQB0FBq3wUQFDuh2L7OAqwKfkeCmUlcOe550FZCciRT7vdnkwm8/n8w8EAE6em8ykWaDablPtybLfbzIApAhTqo0BgOBzudjsrxLjRaLw7GGCaMAGMlXDFLQHSyN9sNv1+X64osiOSEUVMEUDYaDSS6ze5Ammacg7r9TpJErkcrw4ZDgIII5gUuS7wC1QqleVyybq63a5cNyGM4MViIfsCvwCvx+Fw8CbkQTAp1++VX2A2m7GiXq8nuwQEk0Ki7BN+Ac6HM61Wq7JLQDApJMo+4RdYrVb7/f7NkXmk1xBgkaSQKO+JJwkEP6LgDzn4a8qHRsNhRaE+NKBHcqahWoVB/2Jd9LLLfWSaHVP/bHYGaed2zQ+2Xq9bu2aAeW7XedWhQABarZY1PuAcMgOmCFCoj2IBgzvIdDrlMX46GGCWuelI4E/fVHkoK4Hg15bgFy8Ie3U0EGRTdz4P0iliaz8yHn8DHBsMUH9PcpIAAAAASUVORK5CYII='>&nbsp; <b>My location </b>-&nbsp;Zoom to current location.</p>";
        tpContent += "<p><b><br><a href=\"Help.html\" target=\"_blank\">Detailed HELP with Videos</a></b></p>";
        tpContent += "</div>";
        var tp = new TitlePane({
          title: "<b>Map Tool Summary</b>",
          open: false,
          content: tpContent
        });
        this.Tools.appendChild(tp.domNode);
        tp.startup();

        var tpContent = "<div><ul><li><div align='left'><i>CENTER &amp; ZOOM IN </i>- Double Click</div></li><li><div align='left'><i>PAN</i> - Drag the mouse with button pressed</div></li><li><div align='left'><i>RECENTER</i> - Shift + Click</div></li><li><div align='left'><i>ZOOM IN </i>- Mouse scroll forward</div></li><li><div align='left'><i>ZOOM IN </i>(rubber band) - Shift + Drag the mouse</div></li><li><div align='left'><i>ZOOM OUT </i>- Mouse scroll backward</div></li><li><div align='left'><i>ZOOM OUT </i>(rubber band) - Shift + Ctrl + Drag</div></li></ul></div>";
        var tp = new TitlePane({
          title: "<b>Map Navigation</b>",
          open: false,
          content: tpContent
        });
        this.Navigation.appendChild(tp.domNode);
        tp.startup();

        var tpContent = "<div>For suggestions, questions, or comments related to the information provided on this map,";
        tpContent += " please contact Rachel Lindahl, Public Works, at <a href='mailto:RLindahl@cityoftacoma.org?subject=Tacoma RPZ Locator Map' target='_self'>RLindahl@cityoftacoma.org</a> or 253-591-5371.</div>";
        var tp = new TitlePane({
          title: "<b>Questions & Comments</b>",
          open: false,
          content: tpContent
        });
        this.Questions.appendChild(tp.domNode);
        tp.startup();
        //end MJM	
      },

      startup: function() {
        this.inherited(arguments);
        if (common.isDefaultContent(this.config)) {
          this.config.about.aboutContent = common.setDefaultContent(this.config, this.nls);
        }
        this.isOpen = true;
        this.openAtStartAysn = true;
        this.resize();
        jimuUtils.focusFirstFocusByTheme(this, this.customContentNode);
        this.openAtStartAysn = false;

        //Focus customContentNode
        //use firstTabNode for passing focus state to customContentNode (FF)
        this.own(on(this.splashContainerNode, 'focus', lang.hitch(this, function() {
          this.firstTabNode.focus();
        })));
        this.own(on(this.firstTabNode, 'focus', lang.hitch(this, function() {
          this.customContentNode.focus();
        })));

        jimuUtils.setWABLogoDefaultAlt(this.customContentNode);
        //MJM - Started with open Basemap Gallery panel to create combo map (streets & aerial), then opened this widget, so now close the initial widget...	        //Focus customContentNode
        PanelManager.getInstance().closePanel(this.appConfig.widgetPool.widgets[2].id + '_panel'); //close Basemap Gallery Widget
        //-------------------------------------------------------------------------------------------------------------------------------------------------
      },

      resize: function() {
        this._resizeContentImg();
      },

      onOpen: function() {
        this.isOpen = true;
        //resolve issue #15086 when network is so slow.
        setTimeout(lang.hitch(this, function() {
          this.isOpen = false;
        }), 50);
      },

      _resizeContentImg: function() {
        //record current activeElement before resizing
        var _activeElement = document.activeElement;
        html.empty(this.customContentNode);

        var aboutContent = html.toDom(this.config.about.aboutContent);
        html.place(aboutContent, this.customContentNode);
        // single node only(no DocumentFragment)
        if (this.customContentNode.nodeType && this.customContentNode.nodeType === 1) {
          var contentImgs = query('img', this.customContentNode);
          if (contentImgs && contentImgs.length) {
            contentImgs.forEach(lang.hitch(this, function(img) {
              var isNotLoaded = ("undefined" !== typeof img.complete && false === img.complete) ? true : false;
              if (isNotLoaded) {
                this.own(on(img, 'load', lang.hitch(this, function() {
                  this._resizeImg(img);
                })));
              } else {
                this._resizeImg(img);
              }
            }));
          }

          //Init dom's attrs and events again because doms are new after resizing.
          var focusableNodes = jimuUtils.getFocusNodesInDom(this.domNode);
          if (focusableNodes.length) {
            jimuUtils.initFirstFocusNode(this.domNode, focusableNodes[0]);
            jimuUtils.initLastFocusNode(this.domNode, focusableNodes[focusableNodes.length - 1]);
          }

          //focus firstNode if required
          if (this.isOpen || html.isDescendant(_activeElement, this.domNode)) {
            var firstNode = jimuUtils.getFirstFocusNode(this.domNode);
            jimuUtils.focusFirstFocusByTheme(this, firstNode);
            this.isOpen = false;
          }
        }
      },
      _resizeImg: function(img) {
        var customBox = html.getContentBox(this.customContentNode);
        var imgSize = html.getContentBox(img);
        if (imgSize && imgSize.w && imgSize.w >= customBox.w) {
          html.setStyle(img, {
            maxWidth: (customBox.w - 20) + 'px', // prevent x scroll
            maxHeight: (customBox.h - 40) + 'px'
          });
        }
      }
    });
    return clazz;
  });
