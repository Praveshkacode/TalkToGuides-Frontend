import session_img from './session_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import logo from './logo2.png'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import expert1 from './expert1.png'
import expert2 from './expert2.png'
import expert3 from './expert3.png'
import expert4 from './expert4.png'
import expert5 from './expert5.png'
import expert6 from './expert6.png'
import expert7 from './expert7.png'
import expert8 from './expert8.png'
import expert9 from './expert9.png'
import expert10 from './expert10.png'
import expert11 from './expert11.png'
import expert12 from './expert12.png'
import expert13 from './expert13.png'
import expert14 from './expert14.png'
import expert15 from './expert15.png'
import Astrology from './Astrology.png'
import LoveAndRelationship from './LoveAndRelationship.png'
import PalmReading from './PalmReading.png'
import PsychicExpert from './PsychicExpert.png'
import FortuneTelling from './FortuneTelling.png'
import TarotReading from './TarotReading.png'



export const assets = {
    session_img,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo
}

export const specialityData = [
    {
        speciality: 'Psychic Expert',
        image: PsychicExpert
    },
    {
        speciality: 'Love & Relationship',
        image: LoveAndRelationship
    },
    {
        speciality: 'Tarot Reading',
        image: TarotReading
    },
    {
        speciality: 'Fortune Telling',
        image: FortuneTelling
    },
    {
        speciality: 'Astrology',
        image: Astrology
    },
    {
        speciality: 'Palm Reading',
        image: PalmReading
    },
]

export const psychicExperts = [
    {
      _id: 'expert1',
      name: 'Psychic Richard James',
      image: expert1,
      specialities: [
        { type: 'Tarot Reading', price: 50 },
        { type: 'Astrology', price: 60 },
        { type: 'Love & Relationship', price: 55 }
      ],
      experience: '6 Years',
      about: 'Richard specializes in Tarot reading to help you gain clarity in your love life, career decisions, and spiritual path.',
      address: {
        line1: '17th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert3',
      name: 'Psychic Sarah Patel',
      image: expert3,
      specialities: [
        { type: 'Palm Reading', price: 45 },
        { type: 'Psychic Expert', price: 50 },
        { type: 'Tarot Reading', price: 48 }
      ],
      experience: '4 Years',
      about: 'Sarah’s palm readings offer unique glimpses into your fate and emotional strength.',
      address: {
        line1: '37th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert4',
      name: 'Psychic Christopher Lee',
      image: expert4,
      specialities: [
        { type: 'Fortune Telling', price: 55 },
        { type: 'Tarot Reading', price: 53 },
        { type: 'Palm Reading', price: 52 }
      ],
      experience: '7 Years',
      about: 'Christopher provides insightful fortune telling to help you navigate your future with confidence.',
      address: {
        line1: '47th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert5',
      name: 'Psychic Jennifer Garcia',
      image: expert5,
      specialities: [
        { type: 'Love & Relationship', price: 50 },
        { type: 'Tarot Reading', price: 52 },
        { type: 'Astrology', price: 58 }
      ],
      experience: '6 Years',
      about: 'Jennifer offers guidance in love and relationships, helping clients find clarity and healing.',
      address: {
        line1: '57th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert7',
      name: 'Psychic Nina Thompson',
      image: expert7,
      specialities: [
        { type: 'Palm Reading', price: 60 },
        { type: 'Fortune Telling', price: 58 },
        { type: 'Career Guidance', price: 62 }
      ],
      experience: '8 Years',
      about: 'Nina’s readings focus on career lines and personal strength, helping clients take confident steps.',
      address: {
        line1: '77th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert8',
      name: 'Psychic Robert Kim',
      image: expert8,
      specialities: [
        { type: 'Tarot Reading', price: 40 },
        { type: 'Aura Reading', price: 45 },
        { type: 'Chakra Healing', price: 50 }
      ],
      experience: '3 Years',
      about: 'Robert offers deep tarot interpretations focusing on spiritual growth and inner peace.',
      address: {
        line1: '87th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert9',
      name: 'Psychic Isabella Grace',
      image: expert9,
      specialities: [
        { type: 'Love & Relationship', price: 70 },
        { type: 'Tarot Reading', price: 68 },
        { type: 'Soulmate Readings', price: 75 }
      ],
      experience: '9 Years',
      about: 'Isabella is known for resolving complex love dilemmas with clarity and warmth.',
      address: {
        line1: '97th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert11',
      name: 'Psychic Amara Singh',
      image: expert11,
      specialities: [
        { type: 'Psychic Expert', price: 55 },
        { type: 'Aura Reading', price: 58 },
        { type: 'Energy Balancing', price: 60 }
      ],
      experience: '6 Years',
      about: 'Amara is a holistic psychic reader with experience in aura reading and energy balancing.',
      address: {
        line1: '117th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert12',
      name: 'Psychic Daniel Cruz',
      image: expert12,
      specialities: [
        { type: 'Fortune Telling', price: 48 },
        { type: 'Astrology', price: 50 },
        { type: 'Dream Interpretation', price: 52 }
      ],
      experience: '4 Years',
      about: 'Daniel brings a modern approach to traditional fortune telling with accurate results.',
      address: {
        line1: '127th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert13',
      name: 'Psychic Chloe Knight',
      image: expert13,
      specialities: [
        { type: 'Tarot Reading', price: 52 },
        { type: 'Astrology', price: 54 },
        { type: 'Life Coaching', price: 56 }
      ],
      experience: '5 Years',
      about: 'Chloe’s tarot spreads are insightful and empowering for every stage of life.',
      address: {
        line1: '137th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert14',
      name: 'Psychic Leo Johnson',
      image: expert14,
      specialities: [
        { type: 'Love & Relationship', price: 58 },
        { type: 'Tarot Reading', price: 60 },
        { type: 'Relationship Healing', price: 65 }
      ],
      experience: '7 Years',
      about: 'Leo specializes in soulmate connections and healing past relationship wounds.',
      address: {
        line1: '147th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert15',
      name: 'Psychic Tara Kapoor',
      image: expert15,
      specialities: [
        { type: 'Astrology', price: 65 },
        { type: 'Numerology', price: 60 },
        { type: 'Vedic Insights', price: 68 }
      ],
      experience: '8 Years',
      about: 'Tara’s cosmic insights help align your decisions with the stars for maximum harmony.',
      address: {
        line1: '157th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert2',
      name: 'Psychic Emily Larson',
      image: expert2,
      specialities: [
        { type: 'Astrology', price: 60 },
        { type: 'Palm Reading', price: 50 },
        { type: 'Horoscope Matching', price: 55 }
      ],
      experience: '5 Years',
      about: 'Emily uses astrology to provide deep insights into your personality, relationships, and life purpose.',
      address: {
        line1: '27th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert6',
      name: 'Psychic Andrew Williams',
      image: expert6,
      specialities: [
        { type: 'Psychic Expert', price: 50 },
        { type: 'Life Path Guidance', price: 52 },
        { type: 'Tarot Reading', price: 50 }
      ],
      experience: '5 Years',
      about: 'Andrew is a gifted psychic who provides practical and spiritual guidance.',
      address: {
        line1: '67th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    },
    {
      _id: 'expert10',
      name: 'Psychic Thomas Shaw',
      image: expert10,
      specialities: [
        { type: 'Astrology', price: 65 },
        { type: 'Planetary Healing', price: 70 },
        { type: 'Vastu Consultation', price: 72 }
      ],
      experience: '10 Years',
      about: 'Thomas interprets planetary alignments to guide your personal and professional life.',
      address: {
        line1: '107th Cross, Richmond',
        line2: 'Circle, Ring Road, London'
      }
    }
  ];
  
