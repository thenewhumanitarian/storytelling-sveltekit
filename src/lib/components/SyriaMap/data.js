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
        avatarPhoto: 'person1.png',
        profession: 'Olive farmer',
        text: 'Khaled has been cultivating olives on his family’s land for over 20 years, supplying local markets.'
      }
    },
    {
      coords: [36.48744108890202, 33.51351189644581], // Near Idlib, northwest Syria
      slug: 'layla-hammoud',
      popup: {
        id: '1',
        name: 'Layla Hammoud',
        avatarPhoto: 'person2.png',
        profession: 'Vegetable farmer',
        text: 'Layla grows tomatoes, cucumbers, and peppers, which she sells to nearby villages.'
      }
    },
    {
      coords: [35.92074932389779, 34.99813885567918], // Near Al-Hasakah, northeast Syria
      slug: 'ahmad-talal',
      popup: {
        id: '2',
        name: 'Ahmad Talal',
        avatarPhoto: 'person3.png',
        profession: 'Wheat farmer',
        text: 'Ahmad manages a wheat farm, contributing to local grain production for bread-making.'
      }
    },
    {
      coords: [40.70782186626749, 36.192558428838694], // Near Aleppo, northern Syria
      slug: 'maha-kassem',
      popup: {
        id: '3',
        name: 'Maha Kassem',
        avatarPhoto: 'person4.png',
        profession: 'Dairy farmer',
        text: 'Maha raises goats and cows, producing milk and cheese sold in the Aleppo markets.'
      }
    },
    {
      coords: [36.724977485074405, 35.90521349716556], // Near Qamishli, far northeast Syria
      slug: 'youssef-daoud',
      popup: {
        id: '4',
        name: 'Youssef Daoud',
        avatarPhoto: 'person5.png',
        profession: 'Sheep farmer',
        text: 'Youssef tends to a flock of sheep, producing wool and meat for the community.'
      }
    }
  ]
};
