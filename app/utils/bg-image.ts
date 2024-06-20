const bgImages = {
  flowers: {
    identifier: 'flowers',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099093/TaskPro/board_bg_images/desk/nfxep55xgvpq7xitemq1.jkpg'
  },
  'mountains-night': {
    identifier: 'mountains-night',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099093/TaskPro/board_bg_images/desk/fvgiatkjobjaff8jmk73.jpg'
  },
  sakura: {
    identifier: 'sakura',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099094/TaskPro/board_bg_images/desk/rlqsujxtqtgem4cjttec.jpg'
  },
  'night-sky': {
    identifier: 'night-sky',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099093/TaskPro/board_bg_images/desk/ufeq5m5kpdu3ekatkbbp.jpg'
  },
  tropics: {
    identifier: 'tropics',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099151/TaskPro/board_bg_images/tabl/xgjtbiatwnhiljkpzb6h.jpg'
  },
  'light-sky': {
    identifier: 'light-sky',
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099093/TaskPro/board_bg_images/desk/jqddafdgy0urvtc5oncy.jpg'
  },
  'sea-rocks': {
    identifier: 'sea-rocks',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099093/TaskPro/board_bg_images/desk/x4gmpw5gensxpllhrlcu.jpg'
  },
  'blue-ball': {
    identifier: 'blue-ball',
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099094/TaskPro/board_bg_images/desk/dtmqypo6r0v0nktpagku.jpg'
  },
  'red-moon': {
    identifier: 'red-moon',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099094/TaskPro/board_bg_images/desk/q6ybwaw36b4sozcxkqv8.jpg'
  },
  'sea-boat': {
    identifier: 'sea-boat',
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099094/TaskPro/board_bg_images/desk/liwskvsevrrnpidxhjvf.jpg'
  },
  'air-balloons': {
    identifier: 'air-balloons',
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099095/TaskPro/board_bg_images/desk/wfkyahc04dnbj2fvu40t.jpg'
  },
  gorge: {
    identifier: 'gorge',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099095/TaskPro/board_bg_images/desk/mtpc8fa6foucdz8wal5z.jpg'
  },
  'sea-boat-2': {
    identifier: 'sea-boat-2',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099095/TaskPro/board_bg_images/desk/ub8d3hgw3foieu0xrb5b.jpg'
  },
  'air-balloons-2': {
    identifier: 'air-balloons-2',
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099095/TaskPro/board_bg_images/desk/cqh06h1b0se49uigusvm.jpg'
  },
  'northern-lights': {
    identifier: 'northern-lights',
    hasWhiteTextColor: true,
    url: 'https://res.cloudinary.com/dmbnnewoy/image/upload/v1707099096/TaskPro/board_bg_images/desk/ln9qmsybum9dqfhlwmxy.jpg'
  },
  default: {
    identifier: 'default'
  }
}

export const getBgImage = (identifier: keyof typeof bgImages) => {
  return bgImages[identifier] || bgImages.default
}
