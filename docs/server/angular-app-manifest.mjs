
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/tele-seha-web/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/tele-seha-web"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js"
    ],
    "redirectTo": "/tele-seha-web/patient/auth/login",
    "route": "/tele-seha-web/patient"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js"
    ],
    "route": "/tele-seha-web/patient/auth"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-KIFSL3HJ.js",
      "chunk-MO6BYXXU.js",
      "chunk-BYXBJQAS.js",
      "chunk-FBDFS2O5.js",
      "chunk-N6TZMPZI.js",
      "chunk-MKZYENNM.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/auth/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-26MP3JJY.js",
      "chunk-BYXBJQAS.js",
      "chunk-FBDFS2O5.js",
      "chunk-N6TZMPZI.js",
      "chunk-MKZYENNM.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/auth/verify-otp"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-X2G7IDBA.js",
      "chunk-BYXBJQAS.js",
      "chunk-FBDFS2O5.js",
      "chunk-MKZYENNM.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/auth/password"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-ZXTQK6Q7.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-FBDFS2O5.js",
      "chunk-N6TZMPZI.js",
      "chunk-MKZYENNM.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/auth/basic-info"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-RYT4QMMY.js",
      "chunk-N6TZMPZI.js",
      "chunk-MKZYENNM.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/auth/medical-history"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-3VBKVYGF.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-MKZYENNM.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/auth/info-about-you"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-ALXL2NTC.js",
      "chunk-7SWVQGVY.js",
      "chunk-KJWAE34M.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/home"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-GOAH627X.js",
      "chunk-7SWVQGVY.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/specialties"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-LWKD5AFT.js",
      "chunk-U65OHUWT.js",
      "chunk-5XI6UHWY.js",
      "chunk-6GQJT6DV.js",
      "chunk-A4P4ICPZ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js"
    ],
    "route": "/tele-seha-web/patient/allDoctors"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-2DIHKDIE.js",
      "chunk-5XI6UHWY.js",
      "chunk-6GQJT6DV.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/allDoctors/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-DE75WXJV.js",
      "chunk-KJWAE34M.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/allResent"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-2DIHKDIE.js",
      "chunk-5XI6UHWY.js",
      "chunk-6GQJT6DV.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/allResent/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-OXILG2ZL.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-MKZYENNM.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/allResent/*/waitingSession"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-M46BCT3P.js",
      "chunk-NYNAND7Z.js",
      "chunk-A4P4ICPZ.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/videoCall"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-R257VEA6.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/reports"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NBZSFKAJ.js",
      "chunk-HNC5UNYQ.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-MKZYENNM.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/patient/settings"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "redirectTo": "/tele-seha-web/doctor/auth/login",
    "route": "/tele-seha-web/doctor"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js"
    ],
    "route": "/tele-seha-web/doctor/auth"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-MOUH3RR3.js",
      "chunk-UCQNGA7N.js",
      "chunk-MO6BYXXU.js"
    ],
    "route": "/tele-seha-web/doctor/auth/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-LBQMDVG4.js",
      "chunk-UCQNGA7N.js",
      "chunk-BYXBJQAS.js"
    ],
    "route": "/tele-seha-web/doctor/auth/verify-otp"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-CZ4ARTA5.js",
      "chunk-UCQNGA7N.js",
      "chunk-BYXBJQAS.js"
    ],
    "route": "/tele-seha-web/doctor/auth/password"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-DOHSKRSZ.js",
      "chunk-UCQNGA7N.js",
      "chunk-7SWVQGVY.js"
    ],
    "route": "/tele-seha-web/doctor/auth/register/basicInfo"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-7VT2BOAA.js",
      "chunk-UCQNGA7N.js",
      "chunk-BYXBJQAS.js"
    ],
    "route": "/tele-seha-web/doctor/auth/register/createProfile"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-HEIH4UN3.js",
      "chunk-UCQNGA7N.js",
      "chunk-FBDFS2O5.js"
    ],
    "route": "/tele-seha-web/doctor/auth/register/createCertificates"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-QZ5FLYGK.js",
      "chunk-UCQNGA7N.js"
    ],
    "route": "/tele-seha-web/doctor/auth/register/appointment"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-XQM4JNRP.js",
      "chunk-FBDFS2O5.js"
    ],
    "route": "/tele-seha-web/doctor/auth/watingForAcctivation"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-W4WRZS4R.js"
    ],
    "route": "/tele-seha-web/doctor/home"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-N2LHLSNH.js",
      "chunk-6GQJT6DV.js"
    ],
    "route": "/tele-seha-web/doctor/todaysAppointments"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-EF2KA2F5.js",
      "chunk-6GQJT6DV.js"
    ],
    "route": "/tele-seha-web/doctor/followUp"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-AK5FTASN.js",
      "chunk-6GQJT6DV.js"
    ],
    "route": "/tele-seha-web/doctor/weeksAppointments"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-EYWRLU6C.js"
    ],
    "route": "/tele-seha-web/doctor/weeksAppointments/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-CQ4UXCNA.js"
    ],
    "route": "/tele-seha-web/doctor/myAppointments"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-E4LGAGFG.js"
    ],
    "route": "/tele-seha-web/doctor/myAppointments/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-HPZRJ4D3.js",
      "chunk-U65OHUWT.js",
      "chunk-5XI6UHWY.js"
    ],
    "route": "/tele-seha-web/doctor/allDoctors"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-K5ME5SJG.js",
      "chunk-5XI6UHWY.js",
      "chunk-6GQJT6DV.js"
    ],
    "route": "/tele-seha-web/doctor/allDoctors/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-NLRDXOFL.js",
      "chunk-NYNAND7Z.js",
      "chunk-A4P4ICPZ.js"
    ],
    "route": "/tele-seha-web/doctor/videoCall"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-OCBO56UQ.js",
      "chunk-JA2RN66L.js",
      "chunk-DLIYQHIN.js",
      "chunk-GW3UXODD.js",
      "chunk-ZOQAXSU5.js",
      "chunk-N6TZMPZI.js",
      "chunk-JZBMSNE6.js",
      "chunk-UZ2LH42C.js",
      "chunk-MKZYENNM.js"
    ],
    "route": "/tele-seha-web/doctor/settings"
  },
  {
    "renderMode": 2,
    "redirectTo": "/tele-seha-web",
    "route": "/tele-seha-web/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 9589, hash: 'dfbd512e440ca872f2b661d51b760d7770b992f6ecf594edb2a0d09f63988285', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1379, hash: '2d98301c9163cd6b0e4194b9cd33d85e9353192ff7d5df1c98dde377db84315e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 71782, hash: '196d6d3888d58c36b3d93f39fe52c82411896a4d832fae1fd86689a4fe1a464b', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-EY4QAKVR.css': {size: 132925, hash: '4uAvO/rbW1k', text: () => import('./assets-chunks/styles-EY4QAKVR_css.mjs').then(m => m.default)}
  },
};
