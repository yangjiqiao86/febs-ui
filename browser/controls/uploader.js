{/* <div class="febsui-uploader">
  <button onclick='$("#fileObj")[0].click()'>上传图片</button>
  <form id="fileForm" method="post" role="form" enctype="multipart/form-data" style="display:none">
    <input id="fileObj" type="file" name="file" onchange="javascript:SetupWebUploader('/api/users/upload_image', $('#fileForm'), $('#fileObj'))" multiple>
  </form>
  <div class="febsui-uploader-progress">
    <div class="febsui-uploader-progress-bg"></div>
    <span>10%</span>
    <div class="febsui-uploader-progress-cancel"><div class="febsui-icon febsui-icon-error"></div></div>
  </div>
</div> */}
var touchEventPrevent = require('../domHelper').mobile_preventTouchEvent;
var escape_string = require('../escape').escape_string;

var upload = require('./upload');
var uploadErr = require('./upload.err');
var dialog = require('./dialog');

// ie9.
var is_IE9 = window.febs.utils.browserIEVer() <= 9;

exports.uploader_init = uploader_init;

window['_Feb_fegegRRdefaultUploaderError'] = function(err) {
  if (febsui.uploadErr.nofile == err) {
    err = '未选择文件';
  } else if (febsui.uploadErr.sizeExceed == err) {
    err = '文件超出大小';
  } else if (febsui.uploadErr.crc32 == err) {
    err = '文件验证出错';
  } else if (febsui.uploadErr.net == err) {
    err = '网络错误';
  } else {
    err = '上传错误';
  }
  dialog.showAlert(err.toString());
};


/**
* @desc: 初始化uploader控件.
* @return: 
*/
function uploader_init(elem) {
  var elems = elem ? elem : $('.febsui-uploader');
  for (var i = 0; i < elems.length; i++) {
    var dom = $(elems[i]);
    
    if (!dom.hasClass('febsui-uploader')) {
      continue;
    }

    if (!dom.hasClass('febsui-uploader-init')) {
      dom.addClass('febsui-uploader-init');

      var dataAccept = dom.attr('data-accept');
      var dataFilename = dom.attr('data-filename');
      var dataApi = dom.attr('data-api');
      var dataMultiple = dom.attr('data-multiple');
      dataMultiple = dataMultiple == 'false'? ' ': ' multiple="multiple" ';

      if (window.febs.string.isEmpty(dataApi)) {
        throw new Error("uploader need attribute: data-api");
      }


      var uid = 'febsui-uploader-'+febs.crypt.uuid();

      var html = dom.html();
      dom.html('');

      var submitHtml = '';
      if (is_IE9) {
        submitHtml = '<input type="submit" value="submit">';
      }

      var htmlForm = 
'<form id="'+uid+'-form" method="post" role="form" enctype="multipart/form-data" style="display:none">' +
  '<input id="'+uid+'" type="file" name="file" '+dataMultiple+(dataAccept?' accept="'+dataAccept+'"':'') + '>' +
  submitHtml+
'</form>';
      dom.append($(htmlForm));

      var html = '<label id="'+uid+'-label" for="'+uid+'" data-for="'+uid+'"><div class="btn">'+html+'</div>';
      
      var htmlFilename = dataFilename==='true' ? '<span id="'+uid+'-filename" class="febsui-uploader-filename febsui-ellipsis"></span>' : '';

      var htmlPro = 
'<div id="'+uid+'-progress" class="febsui-uploader-progress" style="display:none;">' +
  htmlFilename + '<div class="febsui-uploader-progress-bg" style="width:0%;"></div>' +
  '<span ' + (dataFilename==='true'?' class="febsui-uploader-right"':'') + '>10%</span>' +
'</div>' +
'</label>' +
'<div class="febsui-uploader-progress-cancel"></div>';
      html += htmlPro;

//       var htmlPro = 
// `<div id="${uid}-progress" class="febsui-uploader-progress" style="display:none;">
//   <div class="febsui-uploader-progress-bg" style="width:0%;"></div>
//   ${htmlFilename}<span${dataFilename==='true'?' class="febsui-uploader-right"':''}>10%</span>
//   <div class="febsui-uploader-progress-cancel"><div class="febsui-icon febsui-icon-error"></div></div>
// </div>
// `;
      dom.append(html);
      touchEventPrevent(dom[0]);


      //
      // event.
      //
      $('#'+uid).change(function(env){

        var uploader = $(this).parent().parent('.febsui-uploader');
        
        var _uid = $(this).attr('id');

        if (window.febs.string.isEmpty(this.value) || ($('#'+_uid)[0].files && $('#'+_uid)[0].files.length <= 0)) {
          return;
        }

        window['febsui-uploader-controller-'+_uid] = uploader;

        var label = $('#'+_uid+'-label');
        var cancel = $(uploader.children('.febsui-uploader-progress-cancel')[0]);
        
        var progress = $('#'+_uid+'-progress');
        var progressBg = $(progress.children('.febsui-uploader-progress-bg')[0]);
        var progressSpan = progress.children('span');
        progressSpan = $(progressSpan[progressSpan.length-1]);

        label.attr('style', 'right:35px !important;');
        var labelFor = label.attr('for');
        label.removeAttr('for');

        var uploadHtml = $(label.children('div')[0]);
        uploadHtml.css('display', 'none');
        progress.css('display', 'inline-block');
        progressBg.css('width', '0%');
        progressSpan.html('0%');

        var uploader = $(this).parent().parent('.febsui-uploader');

        var _dataApi = uploader.attr('data-api');
        var _dataMaxSize = uploader.attr('data-maxsize');
        var _dataBegin = uploader.attr('data-begin');
        var _dataFinish = uploader.attr('data-finish');
        var _dataError = uploader.attr('data-error');
        var _dataProgress = uploader.attr('data-progress');
        var _dataTimeout = parseInt(uploader.attr('data-timeout'))||5000;


        // if ($('#'+_uid)[0].files) {

          var cancelControl;

          // trim.
          if (_dataFinish) {
            _dataFinish = _dataFinish.replace(/(^\s*)|(\s*$)/g, "");
          }
          if (_dataError) {
            _dataError = _dataError.replace(/(^\s*)|(\s*$)/g, "");
          } else {
            _dataError = '_Feb_fegegRRdefaultUploaderError';
          }
          if (_dataProgress) {
            _dataProgress = _dataProgress.replace(/(^\s*)|(\s*$)/g, "");
          }
          if (_dataBegin) {
            _dataBegin = _dataBegin.replace(/(^\s*)|(\s*$)/g, "");
          }
          
          _dataMaxSize = _dataMaxSize ? parseInt(_dataMaxSize) : 0;

          // 取消.
          cancel.attr('style', 'display:inline !important;');
          cancel.one('click', function(){
            var __uploader = $(this).parent('.febsui-uploader');
            __uploader.uploaderReset();
            _dataError = null;
            if (cancelControl) cancelControl.abort();
            cancelControl = null;
            delete window["febsui-uploader-controller-"+_uid];
          });

          // 上传.
          upload.upload({
            formObj: $('#'+_uid+'-form'),
            fileObj: $('#'+_uid),
            uploadUrl: _dataApi,
            maxFileSize: _dataMaxSize,
            timeout: _dataTimeout,
            beginCB: function(fileObj, uploader) { 
              cancelControl = uploader;

              var uid = fileObj.attr('id');

              var filename = '';

              if (is_IE9) {
                var indexsp = fileObj[0].value.lastIndexOf('\\');
                if (indexsp > 0) {
                  indexsp = fileObj[0].value.substr(indexsp+1);
                } else {
                  indexsp = fileObj[0].value.lastIndexOf('/');
                  if (indexsp < 0) { console.log('can\'t find filename'); indexsp = ''; }
                  else 
                    indexsp = fileObj[0].value.substr(indexsp+1);
                }
    
                filename = indexsp;
                filename = escape_string(filename);
                $('#'+_uid+'-filename').html(filename);
              }
              else {
                filename = $('#'+_uid)[0].files[0].name;
                filename = escape_string(filename);
                $('#'+_uid+'-filename').html(filename);
              }
              filename = window.febs.string.replace(filename, '"', '\"');

              if (_dataBegin) {
                var i = 0;
                for (; i < _dataBegin.length; i++) {
                  if (!((_dataBegin[i] >= 'a' && _dataBegin[i] <= 'z')
                  || (_dataBegin[i] >= 'A' && _dataBegin[i] <= 'Z')
                  || _dataBegin[i] == '_')) {
                    break;
                  }
                }
                if (i >= _dataBegin.length) {
                  var controlId = 'febsui-cancel-'+febs.crypt.uuid();

                  eval(_dataBegin+'(window["febsui-uploader-controller-'+uid+'"], "'+filename+'")');
                }
                else {
                  eval(_dataBegin);
                }
              }

              if (window["febsui-uploader-controller-"+uid]) {
                window["febsui-uploader-controller-"+uid].trigger('uploadBegin', {filename:filename});
              }
            },
            finishCB: function(err, fileObj, serverData) {
              if (err) {

                cancel.removeAttr('style');
                label.removeAttr('style');
                label.attr('for', label.attr('data-for'));
                uploadHtml.css('display', 'inline-block');
                progress.css('display', 'none');

                if (err != uploadErr.nofile
                  && err != uploadErr.sizeExceed
                  && err != uploadErr.crc32
                  && err != uploadErr.net)
                {
                  console.log(err);
                }

                var uid = fileObj.attr('id');

                if (_dataError) {
                  var i = 0;
                  for (; i < _dataError.length; i++) {
                    if (!((_dataError[i] >= 'a' && _dataError[i] <= 'z')
                    || (_dataError[i] >= 'A' && _dataError[i] <= 'Z')
                    || _dataError[i] == '_')) {
                      break;
                    }
                  }
                    
                  if (i >= _dataError.length) {
                    err = err.toString();
                    err = window.febs.string.replace(err, '"', '\"');
                    eval(_dataError+'(window["febsui-uploader-controller-'+uid+'"], "'+err+'")');
                  }
                  else {
                    eval(_dataError);
                  }
                }

                if (window["febsui-uploader-controller-"+uid]) {
                  window["febsui-uploader-controller-"+uid].trigger('uploadError', {err:err});
                  delete window["febsui-uploader-controller-"+uid];
                }
                // reset.
                cancel.trigger('click');
                cancel.off('click');
              }
              // 上传成功.
              else
              {
                cancelControl = null;
                var percent = "100%"
                progressBg.css('width', percent);
                progressSpan.html(percent);

                cancel.removeAttr('style');
                label.removeAttr('style');
                label.attr('for', label.attr('data-for'));

                var uid = fileObj.attr('id');

                if (_dataFinish) {
                  var i = 0;
                  for (; i < _dataFinish.length; i++) {
                    if (!((_dataFinish[i] >= 'a' && _dataFinish[i] <= 'z')
                    || (_dataFinish[i] >= 'A' && _dataFinish[i] <= 'Z')
                    || _dataFinish[i] == '_')) {
                      break;
                    }
                  }
                    
                  if (i >= _dataFinish.length) {

                    var finishData = 'febsui-finish-'+febs.crypt.uuid();
                    window[finishData] = serverData;

                    eval(_dataFinish+'(window["febsui-uploader-controller-'+uid+'"], window["'+finishData+'"])');
                    delete window[finishData];
                  }
                  else {
                    eval(_dataFinish);
                  }
                }

                window["febsui-uploader-controller-"+uid].trigger('uploadFinish', {responseData:serverData});
                delete window["febsui-uploader-controller-"+uid];
              }

              fileObj[0].value = "";
            },
            progressCB: function(fileObj, percent) {
              var pp = percent;
              percent = percent * 100 + "%"
              progressBg.css('width', percent);
              progressSpan.html(percent);

              var uid = fileObj.attr('id');

              if (_dataProgress) {
                var i = 0;
                for (; i < _dataProgress.length; i++) {
                  if (!((_dataProgress[i] >= 'a' && _dataProgress[i] <= 'z')
                  || (_dataProgress[i] >= 'A' && _dataProgress[i] <= 'Z')
                  || _dataProgress[i] == '_')) {
                    break;
                  }
                }

                if (i >= _dataProgress.length) {
                  eval(_dataProgress+'(window["febsui-uploader-controller-'+uid+'"], parseFloat('+pp+'))');
                }
                else {
                  eval(_dataProgress);
                }
              }

              if (window["febsui-uploader-controller-"+uid]) {
                window["febsui-uploader-controller-"+uid].trigger('uploadProgress', {progress:parseFloat(pp)});
              }
            }
          });
        // } // if.
      });

    }
  } // for.
}

