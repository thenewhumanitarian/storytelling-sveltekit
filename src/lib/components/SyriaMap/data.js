export const MAP_DATA = {
  center: [38.9968, 34.8021],
  zoom: 6,
  // mapStyle: 'mapbox://styles/tnh-storytelling/cm309p8hh00ts01pi598x56fh',
  mapStyle: 'mapbox://styles/tnh-storytelling/cm2zyeivu00su01qw4lvjbylv',
  markers: [
    {
      coords: [36.356273934384646, 35.58666464764166], // Near Homs, central Syria
      slug: 'khaled-al-faris',
      popup: {
        id: '0',
        name: 'Khaled Al-Faris',
        avatarPhoto: 'person1.png', // male photo
        profession: 'Olive farmer',
        text: 'Khaled has been cultivating olives on his family’s land for over 20 years, supplying local markets.',
        nodeId: '263761'
      }
    },
    {
      coords: [36.48744108890202, 33.51351189644581], // Near Idlib, northwest Syria
      slug: 'layla-hammoud',
      popup: {
        id: '1',
        name: 'Layla Hammoud',
        avatarPhoto: 'person2.png', // female photo
        profession: 'Vegetable farmer',
        text: 'Layla grows tomatoes, cucumbers, and peppers, which she sells to nearby villages.',
        nodeId: '263761'
      }
    },
    {
      coords: [35.92074932389779, 34.99813885567918], // Near Al-Hasakah, northeast Syria
      slug: 'ahmad-talal',
      popup: {
        id: '2',
        name: 'Ahmad Talal',
        avatarPhoto: 'person4.png', // swapped to male photo
        profession: 'Wheat farmer',
        text: 'Ahmad manages a wheat farm, contributing to local grain production for bread-making.',
        nodeId: '263761'
      }
    },
    {
      coords: [40.70782186626749, 36.192558428838694], // Near Aleppo, northern Syria
      slug: 'maha-kassem',
      popup: {
        id: '3',
        name: 'Maha Kassem',
        avatarPhoto: 'person3.png', // swapped to female photo
        profession: 'Dairy farmer',
        text: 'Maha raises goats and cows, producing milk and cheese sold in the Aleppo markets.',
        nodeId: '263761'
      }
    },
    {
      coords: [36.724977485074405, 35.90521349716556], // Near Qamishli, far northeast Syria
      slug: 'yasmin-daoud',
      popup: {
        id: '4',
        name: 'Yasmin Daoud', // changed name to female
        avatarPhoto: 'person5.png', // female photo
        profession: 'Sheep farmer',
        text: 'Yasmin tends to a flock of sheep, producing wool and meat for the community.',
        nodeId: '263761'
      }
    }
  ]
};
