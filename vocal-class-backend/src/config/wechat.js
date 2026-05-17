require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

/**
 * 微信小程序配置
 */
const wechatConfig = {
  appId: process.env.WECHAT_APPID || 'wx45a282f204420a61',
  appSecret: process.env.WECHAT_APPSECRET || '5c0a269cd9582a4f258734b077000ee6'
};

module.exports = wechatConfig;

