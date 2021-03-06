// import { $ } from 'febs-browser';

// require('febs-browser');

if (!$) {
  throw new Error('must import febs first');
}

var loading = require('./loading');
exports.loading_isVisiable = loading.loading_isVisiable;
exports.loading_show = loading.loading_show;
exports.loading_show_text = loading.loading_show_text;
exports.loading_hide = loading.loading_hide;

exports.page_init  = require('./page').page_init;
exports.uploadBase64  = require('./upload.base64').uploadBase64;
exports.upload  = require('./upload').upload;
exports.uploadErr = require('./upload.err');

var toast = require('./toast');
exports.toast = toast.showToast;
exports.toast_hide = toast.hideToast;

var dialog = require('./dialog');
exports.dialog_hide = dialog.hide;
exports.dialog_showAlert = dialog.showAlert;
exports.dialog_showConfirm = dialog.showConfirm;
exports.dialog_showConfirmEdit = dialog.showConfirmEdit;

var switcha = require('./switch');
exports.ui_switch_init = switcha.switch_init;
exports.ui_switch_init_event = switcha.switch_init_event;

var popovera = require('./popover');
exports.ui_popover_init = popovera.popover_init;

var dialoga = require('./dialog');
exports.ui_dialog_init = dialoga.dialog_init;

var actionsheeta = require('./actionsheet');
exports.ui_actionsheet_init = actionsheeta.actionsheet_init;

var uploadera = require('./uploader');
exports.ui_uploader_init = uploadera.uploader_init;

var checkboxa = require('./checkbox');
exports.ui_checkbox_init = checkboxa.checkbox_init;
exports.ui_checkbox_init_event = checkboxa.checkbox_init_event;

var radioa = require('./radio');
exports.ui_radio_init = radioa.radio_init;
exports.ui_radio_init_event = radioa.radio_init_event;

var loadinga = require('./loading');
exports.ui_spin_init = loadinga.spin_init;

var buttona = require('./button');
exports.ui_button_init = buttona.button_init;
exports.ui_button_init_event = buttona.button_init_event;

var swipera = require('./swiper');
exports.ui_swiper_init = swipera.swiper_init;
exports.ui_swiper_init_event = swipera.swiper_init_event;



/**
* @desc: 初始化所有ui
* @return: 
*/
exports.ui_init = function() {
  swipera.swiper_init();
  switcha.switch_init();
  popovera.popover_init();
  dialoga.dialog_init();
  actionsheeta.actionsheet_init();
  uploadera.uploader_init();
  checkboxa.checkbox_init();
  radioa.radio_init();
  loadinga.spin_init();
  buttona.button_init();
}

// for mobile active.
$(document).on('touchstart', function(){});

$(document).ready(function(){
  // init.
  exports.ui_init();
});
