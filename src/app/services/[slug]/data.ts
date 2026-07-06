import { SubServiceHeroData } from '@/src/components/Service/SubServiceHero';

export interface SectionOneData {
  title: string;
  paragraph: string;
  bgImageUrl: string;
  sideImageUrl: string;
  fourParagraphs: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SectionTwoData {
  title: string;
  bgImageUrl: string;
  faqs: FAQItem[];
}

export interface FullServiceData {
  slug: string;
  hero: SubServiceHeroData;
  sectionOne: SectionOneData;
  sectionTwo: SectionTwoData;
  cta: {
    title: string;
    description: string;
    buttonText: string;
  };
}

export const GRAND_POOLS_DATA: Record<string, FullServiceData> = {
  'Residential-pools-Construction': {
    slug: 'Residential-pools-Construction',
    hero: {
      title: 'Residential Pool Construction',
      subtitle: 'Tailored pools for relaxing, hosting, and elevated outdoor living.',
      bgImageUrl: '/service-1-hero.webp',
      tabs: [
        {
          label: 'From Vision to Reality',
          type: 'paragraph',
          content: 'At Grand Pools, every new pool project begins with your vision. We take the time to understand your needs, style, and the space you’re working with—then bring it to life with a custom design and flawless construction.'
        },
        {
          label: 'Designed Around You',
          type: 'paragraph',
          content: 'Every layout footprint is sculpted around your specific landscape contours, optimizing spatial workflow and view corridors to fit your family lifestyle perfectly.'
        },
        {
          label: 'Built with Precision & Quality',
          type: 'points',
          content: [
            'Premium shotcrete pool shell formulation',
            'Laser-aligned waterline tile installations',
            'Monolithic structural engineer review approvals'
          ]
        },
        {
          label: 'Smooth Process',
          type: 'paragraph',
          content: 'From permitting and clearing to plumbing and final plaster accents, we coordinate the structural timeline cleanly so you stay completely informed.'
        },
        {
          label: 'Optional Upgrades & Features',
          type: 'points',
          content: [
            'Vanishing pool overflow parameters',
            'Smart smartphone automation arrays',
            'Bespoke stone water cascade waterfalls'
          ]
        }
      ]
    },
    sectionOne: {
      title: 'Olympic-Grade Architecture',
      paragraph: 'Our residential builds are structurally engineered to handle custom volume profiles, leveraging deep engineering methodologies to guarantee decades of flawless operational durability.',
      bgImageUrl: '/images/single-service-8-bg.webp',
      sideImageUrl: '/images/single-service-8.webp',
      fourParagraphs: [
        'Custom shotcrete reinforcement guarantees long-term structural load safety.',
        'Precision plumbing alignment scales spatial flow parameters optimally.',
        'Sleek modern tiling selections integrate seamlessly with deck environments.',
        'Architectural design passes continuous monolithic engineer review guidelines.'
      ]
    },
    sectionTwo: {
      title: 'Structural Specifications & FAQs',
      bgImageUrl: '/images/single-service-25.webp',
      faqs: [
        { question: 'What is the standard build timeline?', answer: 'Most custom shotcrete pools require 8 to 12 weeks depending on site access and structural complexity.' },
        { question: 'Do you secure local municipal permits?', answer: 'Yes, we handle all engineering submissions, environmental zoning clearances, and construction permits.' },
        { question: 'Can smart water automation features be retrofitted later?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' }
      ]
    },
    cta: {
      title: 'Everything You Need To Know',
      description: 'Ready to break ground on a custom concrete pool design tailored explicitly to your landscape layout?',
      buttonText: 'Get A Free Consultation'
    }
  },
  'residential-pools': {
    slug: 'residential-pools',
    hero: {
      title: 'Luxury Residential',
      subtitle: 'Bespoke Private Staycations',
      bgImageUrl: '/images/residential-hero.webp',
      tabs: [
        {
          label: 'From Vision to Reality',
          type: 'paragraph',
          content: 'Crafting premium backyard spaces that seamlessly combine sleek modern water elements with elegant landscape design. Our expert team ensures premium execution on every luxury build.'
        },
        {
          label: 'Designed Around You',
          type: 'paragraph',
          content: 'Bespoke pool profiles built explicitly to complement high-end residential architectural structures and natural site elevations.'
        },
        {
          label: 'Optional Upgrades & Features',
          type: 'points',
          content: [
            'Infinity edge & vanishing glass profiles',
            'Smart automation integrations',
            'Premium diamond-brite finish options'
          ]
        }
      ]
    },
    sectionOne: {
      title: 'Bespoke Concrete Contours',
      paragraph: 'Every high-end residential build begins with premium custom concrete profiles styled perfectly to fit your land contours, ensuring architectural impact from every viewing angle.',
      bgImageUrl: '/images/residential-details-bg.webp',
      sideImageUrl: '/images/residential-details.webp',
      fourParagraphs: [
        'Vanishing edge structures carve sleek, unobstructed views directly into drop-offs.',
        'Bespoke concrete curves mold completely around modern high-end architectural footprints.',
        'Custom internal steps and sun shelves maximize functional shallow-water real estate.',
        'Premium diamond aggregate finishes capture light flawlessly for maximum brilliance.'
      ]
    },
    sectionTwo: {
      title: 'Luxury Integrations Explained',
      bgImageUrl: '/images/residential-features.webp',
      faqs: [
        { question: 'What options do I have for internal finishes?', answer: 'We offer specialized polished aggregate blends, premium quartz formulations, and fully tiled mosaic options.' },
        { question: 'How do vanishing edge parameters perform?', answer: 'They leverage lower catch basins paired with dedicated balance valves to handle subtle pool water overflow smoothly.' }
      ]
    },
    cta: {
      title: 'Let’s Design Your Oasis',
      description: 'Consult with our principal architects to layout your backyard landscape blueprint.',
      buttonText: 'Start Your Project'
    }
  },
  'pool-renovation': {
    slug: 'pool-renovation',
    hero: {
      title: 'Pool Restorations',
      subtitle: 'Breathing New Life',
      bgImageUrl: '/images/renovation-hero.webp',
      tabs: [
        {
          label: 'From Vision to Reality',
          type: 'paragraph',
          content: 'Transforming older concrete pool shells into modern architectural centerpieces. We seamlessly integrate structural renovations with upgraded modern aesthetics.'
        },
        {
          label: 'Built with Precision & Quality',
          type: 'points',
          content: [
            'Complete concrete shell reinforcement fixes',
            'Hydraulic plumbing pressure safety tests',
            'Premium architectural masonry restoration'
          ]
        },
        {
          label: 'Modern Upgrades',
          type: 'paragraph',
          content: 'Easily update layout elements by introducing thermal heating systems, salt chlorination conversions, or modern shallow sun shelves.'
        }
      ]
    },
    sectionOne: {
      title: 'Modern Structural Refit',
      paragraph: 'We completely revitalize aging frameworks, removing degraded masonry to pave the way for modern sub-surface layouts, updated waterline tiling, and highly efficient structural finishes.',
      bgImageUrl: '/images/renovation-details-bg.webp',
      sideImageUrl: '/images/renovation-details.webp',
      fourParagraphs: [
        'Complete removal of failing sub-layers restores structural integrity before replastering.',
        'Underground pressure scanning isolates and seals historical fluid leaks.',
        'Modern waterline tile replacement updates the core palette of the pool shell.',
        'Structural modification introduces sun shelves and shallow lounges to old footprints.'
      ]
    },
    sectionTwo: {
      title: 'Restoration Scope & FAQ',
      bgImageUrl: '/images/renovation-features.webp',
      faqs: [
        { question: 'Can you fix cracked concrete pool shells?', answer: 'Yes, we apply high-tensile staples alongside epoxy injection loops to restore structural engineering load tolerances.' },
        { question: 'Is it possible to convert an older pool to salt chlorination?', answer: 'Absolutely. We seamlessly swap in inline electrolytic cells during the plumbing overhaul phase.' }
      ]
    },
    cta: {
      title: 'Restore Your Structure',
      description: 'Bring aging structural architecture back to pristine engineering operational standards.',
      buttonText: 'Book Structural Inspection'
    }
  },
  'equipment-maintenance': {
    slug: 'equipment-maintenance',
    hero: {
      title: 'Advanced Mechanics',
      subtitle: 'Pristine Water Quality',
      bgImageUrl: '/images/equipment-hero.webp',
      tabs: [
        {
          label: 'System Engineering',
          type: 'paragraph',
          content: 'Designing high-efficiency mechanical rooms that maintain optimal chemical configurations automatically, so your water stays crystal clear with minimal footprint.'
        },
        {
          label: 'Mechanical Features',
          type: 'points',
          content: [
            'Variable speed smart circulation pumps',
            'UV and ozone sanitation system integration',
            'Proactive digital control automation monitoring'
          ]
        }
      ]
    },
    sectionOne: {
      title: 'Precision Hydraulic Engineering',
      paragraph: 'Our complex mechanical room setups maximize water flow turnover rates while drastically lowering electrical expenditure, combining robust commercial performance with clean architectural styling.',
      bgImageUrl: '/images/equipment-details-bg.webp',
      sideImageUrl: '/images/equipment-details.webp',
      fourParagraphs: [
        'Variable-speed circulation systems scale loop frequencies dynamically for quiet operations.',
        'Synergized UV-C and ozone secondary loops terminate persistent chloramine residues.',
        'Live telemetry arrays stream monitoring diagnostics to your smartphone application.',
        'Advanced automated dosing loops minimize manual acid and sanitizer handling.'
      ]
    },
    sectionTwo: {
      title: 'Mechanical System Diagnostics',
      bgImageUrl: '/images/equipment-features.webp',
      faqs: [
        { question: 'How much energy do variable speed smart pumps save?', answer: 'They drop your circulation draw rates by up to 70% compared to legacy single-speed hardware matrices.' },
        { question: 'What are the operational impacts of UV & Ozone setups?', answer: 'They lower standard chlorine consumption profiles drastically by taking on the heavy secondary oxidation load.' }
      ]
    },
    cta: {
      title: 'Optimize System Performance',
      description: 'Upgrade your mechanical setup to zero-stress automated sanitation loops.',
      buttonText: 'Request Hardware Audit'
    }
  }
};