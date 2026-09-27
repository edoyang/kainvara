// Store wide copy and links, kept in one place so they are easy to change.
export const site = {
  // "kain" is Indonesian for cloth.
  name: 'Kainvara',
  tagline: 'Modern fashion store',
  phone: '+61 415 840 205',
  phoneHref: 'tel:+61415840205',
  email: 'edoyangz@gmail.com',
  location: 'Sydney, NSW, Australia',
  promo: 'New here? Use code WELCOME10 for 10% off your first order',
  owner: {
    name: 'Edoardo (Edo Yang)',
    url: 'https://edoyang.github.io/',
  },
  // Leave a link empty to hide its icon everywhere on the site.
  social: {
    linkedin: 'https://www.linkedin.com/in/edoyang/',
    github: 'https://github.com/edoyang',
    instagram: '',
  },
}

export function pageTitle(title?: string): string {
  return title ? `${title} | ${site.name}` : `${site.name} | ${site.tagline}`
}

export const photo = (id: string) => `https://images.unsplash.com/photo-${id}`

// Photos used by the page layouts (heroes, banners, team). Product photos
// come from the database.
export const media = {
  heroSlides: [photo('1483985988355-763728e1935b'), photo('1469334031218-e382a71b716b')],
  featureBanner: photo('1556905055-8f358a7a47b2'),
  universe: photo('1487222477894-8943e31ef7b2'),
  aboutHero: photo('1483985988355-763728e1935b'),
  contactHero: photo('1573496359142-b8d87734a5a2'),
  videoPoster: photo('1580137189272-c9379f8864fd'),
  video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  workWithUs: photo('1488426862026-3ee34a7d66df'),
  teamCollage: [
    photo('1553877522-43269d4ea984'),
    photo('1542744173-8e7e53415bb0'),
    photo('1524178232363-1fb2b075b655'),
    photo('1522202176988-66273c2fd55f'),
    photo('1556761175-5973dc0f32e7'),
  ],
  weekTop: photo('1441986300917-64674bd600d8'),
  weekSide: [photo('1445205170230-053b83016050'), photo('1523381210434-271e8be1f52b')],
  loveWhatWeDo: [photo('1558769132-cb1aea458c5e'), photo('1567401893414-76b7b1e5a7a5')],
  authSide: photo('1441984904996-e0b6ba687e04'),
}

// The team shown on the About and Team pages is fictional demo content.
export const team = [
  { name: 'Amelia Hart', role: 'Founder and Creative Director', image: photo('1494790108377-be9c29b29330') },
  { name: 'Marcus Doyle', role: 'Head of Product', image: photo('1507003211169-0a1dd7228f2d') },
  { name: 'Priya Nair', role: 'Lead Designer', image: photo('1534528741775-53994a69daeb') },
  { name: 'Daniel Reyes', role: 'Head of Engineering', image: photo('1500648767791-00dcc994a43e') },
  { name: 'Sofia Lindqvist', role: 'Brand Manager', image: photo('1438761681033-6461ffad8d80') },
  { name: 'Theo Bennett', role: 'Operations Lead', image: photo('1506794778202-cad84cf45f1d') },
  { name: 'Hannah Cole', role: 'Customer Care Lead', image: photo('1580489944761-15a19d654956') },
  { name: 'Victor Hale', role: 'Finance Director', image: photo('1560250097-0b93528c311a') },
  { name: 'Layla Haddad', role: 'Senior Buyer', image: photo('1544005313-94ddf0286df2') },
]
