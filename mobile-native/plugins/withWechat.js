const {
  withAndroidManifest,
  withInfoPlist,
  withEntitlementsPlist,
  createRunOncePlugin,
  withMainActivity,
} = require('@expo/config-plugins');

const pkg = require('../package.json');

const withWechatAndroid = (config, { appId, universalLink }) => {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    const packageName = config.android.package;

    // Add WXEntryActivity
    mainApplication.activity = mainApplication.activity || [];
    // Check if WXEntryActivity already exists
    const hasEntryActivity = mainApplication.activity.some(
      (activity) => activity.$['android:name'] === '.wxapi.WXEntryActivity'
    );

    if (!hasEntryActivity) {
      mainApplication.activity.push({
        $: {
          'android:name': '.wxapi.WXEntryActivity',
          'android:label': '@string/app_name',
          'android:theme': '@android:style/Theme.Translucent.NoTitleBar',
          'android:exported': 'true',
          'android:taskAffinity': packageName,
          'android:launchMode': 'singleTask',
        },
      });
    }

    // Add WXPayEntryActivity
    const hasPayEntryActivity = mainApplication.activity.some(
      (activity) => activity.$['android:name'] === '.wxapi.WXPayEntryActivity'
    );

    if (!hasPayEntryActivity) {
      mainApplication.activity.push({
        $: {
          'android:name': '.wxapi.WXPayEntryActivity',
          'android:label': '@string/app_name',
          'android:theme': '@android:style/Theme.Translucent.NoTitleBar',
          'android:exported': 'true',
          'android:taskAffinity': packageName,
          'android:launchMode': 'singleTask',
        },
      });
    }

    // Add queries for WeChat
    config.modResults.manifest.queries = config.modResults.manifest.queries || [];
    const queries = config.modResults.manifest.queries;
    
    // Check if package query already exists
    const hasWechatQuery = queries.some(
      (q) => q.package && q.package.some(p => p.$['android:name'] === 'com.tencent.mm')
    );

    if (!hasWechatQuery) {
        if(!queries[0]) queries[0] = {};
        if(!queries[0].package) queries[0].package = [];
        queries[0].package.push({ $: { 'android:name': 'com.tencent.mm' } });
    }

    return config;
  });
};

const withWechatIOS = (config, { appId, universalLink }) => {
  config = withInfoPlist(config, (config) => {
    // Add LSApplicationQueriesSchemes
    const existingSchemes = config.modResults.LSApplicationQueriesSchemes || [];
    const wechatSchemes = ['weixin', 'wechat', 'weixinULAPI'];
    
    wechatSchemes.forEach(scheme => {
        if (!existingSchemes.includes(scheme)) {
            existingSchemes.push(scheme);
        }
    });
    
    config.modResults.LSApplicationQueriesSchemes = existingSchemes;

    // Add URL Types
    const existingUrlTypes = config.modResults.CFBundleURLTypes || [];
    const hasUrlType = existingUrlTypes.some(
      (urlType) => urlType.CFBundleURLSchemes && urlType.CFBundleURLSchemes.includes(appId)
    );

    if (!hasUrlType) {
      existingUrlTypes.push({
        CFBundleURLName: 'weixin',
        CFBundleURLSchemes: [appId],
      });
    }
    config.modResults.CFBundleURLTypes = existingUrlTypes;

    return config;
  });

  config = withEntitlementsPlist(config, (config) => {
    // Add Universal Link
    if (universalLink) {
        const domain = universalLink.replace('https://', '').replace(/\/$/, '');
        const existingDomains = config.modResults['com.apple.developer.associated-domains'] || [];
        const appLinks = `applinks:${domain}`;
        
        if (!existingDomains.includes(appLinks)) {
            existingDomains.push(appLinks);
        }
        
        config.modResults['com.apple.developer.associated-domains'] = existingDomains;
    }
    return config;
  });

  return config;
};

const withWechat = (config, props) => {
  config = withWechatAndroid(config, props);
  config = withWechatIOS(config, props);
  return config;
};

module.exports = createRunOncePlugin(withWechat, pkg.name, pkg.version);
