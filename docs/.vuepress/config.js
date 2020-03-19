module.exports = {
  "title": "HEROES NEVER DIE",
  "description": " ",
  "dest": "public",
  "head": [
    [
      "link",
      {
        "rel": "icon",
        "href": "/favicon.ico"
      }
    ],
    [
      "meta",
      {
        "name": "viewport",
        "content": "width=device-width,initial-scale=1,user-scalable=no"
      }
    ]
  ],
  "theme": "reco",
  "themeConfig": {
    nav: [
      { text: 'Home', link: '/', icon: 'reco-home' },
      { text: 'Notes', link: '/views/notes/', icon: 'reco-document' },
      { text: 'Daily', link: '/views/daily/', icon: 'reco-other' },
      { text: 'TimeLine', link: '/timeLine/', icon: 'reco-date' },
      { text: 'Link',
        icon: 'reco-message',
        items: [
          { text: 'NPM', link: '', icon: 'reco-npm' },
          { text: 'GitHub', link: '', icon: 'reco-github' },
          { text: '简书', link: '', icon: 'reco-jianshu' },
          { text: 'CSDN', link: '', icon: 'reco-csdn' },
          { text: '博客圆', link: '', icon: 'reco-bokeyuan' },
          { text: 'WeChat', link: '', icon: 'reco-wechat' },
        ]
      }
    ],
    "type": "blog",
    "blogConfig": {
      "category": {
        "location": 2,
        "text": "FrontEnd"
      },
      "tag": {
        "location": 3,
        "text": "Tag"
      }
    },
    "logo": "https://resource.limeili.co/logo.png",
    "search": true,
    "searchMaxSuggestions": 10,
 
    "sidebar": {
      '/views/notes/': [
        {
          title: 'Group 1',
          children: [
            '笔记1',
            '笔记2'
          ]
        },
        {
          title: 'Group 2',
          children: [
            '笔记1',
            '笔记2'
          ]
        }
      ],
      

      '/views/daily/': [
        {
          title: 'CSS',
          
          children: [
            '笔记1',
            '笔记2'
          ]
        },
        {
          title: 'JS',
          
          children: [
            '笔记1',
            '笔记2'
          ]
        },
        {
          title: '网络',
          children: [
            '笔记1',
            '笔记2'
          ]
        },
        {
          title: '浏览器',
          children: [
            '笔记1',
            '笔记2'
          ]
        },
        {
          title: 'VUE',
          children: [
            '笔记1',
            '笔记2'
          ]
        },
        {
          title: '编程',
          children: [
            '笔记1',
            '笔记2'
          ]
        },
        {
          title: '异步',
          children: [
            '笔记1',
            '笔记2'
          ]
        }
      ]
    },



    "permalink": "/:year/:month/:day/:slug",
    "lastUpdated": "Last Updated",
    "author": "辽北地区著名狠人",
    "authorAvatar": "https://resource.limeili.co/avatar.png",
    "record": "浙ICP备15043084号-2",
    "startYear": "2019",
    "vssueConfig": {
      platform: 'github',
      owner: 'hdulsh',
      repo: 'vuepress-blog',
      clientId: '4a887f30a4b172f458a7',
      clientSecret: '03809354717faf74bea2d4c146d285ade3334525',
    }
  },
}