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
}

export const SERVICES_DATA: Record<string, FullServiceData> = {
  'residential-pools-construction': {
    slug: 'residential-pools-construction',
    hero: {
      title: 'Residential Pool Construction',
      subtitle: 'Tailored pools for relaxing, hosting, and elevated outdoor living.',
      bgImageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1920&q=80',
      tabs: [
        {
          label: 'From Vision to Reality',
          type: 'paragraph',
          content: 'At Grand Pools, every new pool project begins with your vision. We take the time to understand your needs, style, and the space you’re working with—then bring it to life with a custom design and flawless construction.'
        },
        {
          label: 'Designed Around You',
          type: 'paragraph',
          content: 'We create pools that fit seamlessly into your outdoor area—whether you prefer sleek modern lines, a resort-inspired look, or something completely unique. Our designs take into account functionality, visual appeal, and the flow of your space.'
        },
        {
          label: 'Built with Precision & Quality',
          type: 'paragraph',
          content: 'Our experienced team manages the entire construction process, using top-grade materials and proven methods to ensure long-lasting durability. From excavation and plumbing to concreting and tiling, we oversee every detail with care.'

        },
        {
          label: 'Smooth Process',
          type: 'paragraph',
          content: 'We handle all planning, permits, and compliance so you don’t have to. Throughout the project, you’ll be kept updated at each step, with clear communication and timelines to ensure a smooth, stress-free experience.'
        },
        {
          label: 'Optional Upgrades & Features',
          type: 'paragraph',
            content: 'Enhance your new pool with spa zones, infinity edges, LED lighting, in-floor cleaning systems, water features, or heating options. We’ll guide you through the latest trends and technologies to elevate your pool experience.'

        }
      ]
    },
    sectionOne: {
      title: 'Design Build Details',
      paragraph: 'From the first design concept to the final finishing details, we manage every stage of your pool project with care, quality materials, and a clear process.',
      bgImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1920&q=80',
      sideImageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
      fourParagraphs: [
        'Attention to Detail\nEvery detail is considered with care  from the pool layout and materials to the final finish  creating a result that feels precise, polished, and built to last.',
        'Innovative Solution\nsWe use modern pool systems, smart equipment, and considered design solutions to create a pool that feels efficient, functional, and built for today’s lifestyle.',
        'Built for Longevity\nWe use quality materials, trusted construction methods, and durable finishes to create pools that are made to perform beautifully for years to come.',
        'Seamless Experience\nWe keep the process clear and well-managed, with transparent communication and steady guidance from the first conversation through to completion.'
      ]
    },
    sectionTwo: {
      title: 'Everything You Need to Know',
      bgImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80',
      faqs: [
        { question: 'How long does new pool construction take?', answer: 'Most custom shotcrete pools require 8 to 12 weeks depending on site access and structural complexity.' },
        { question: 'What is included in the new pool construction service?', answer: 'Yes, we handle all engineering submissions, environmental zoning clearances, and construction permits.' },
        { question: 'Can I customise the shape and features of my pool?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' },
        { question: 'Do you handle permits and approvals?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' },
        { question: 'How do I get started with a new pool build?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' }
      ]
    }
  },

  'pool-equipment-and-installation': {
    slug: 'pool-equipment-and-installation',
    hero: {
      title: 'Pool Equipment & Installation',
      subtitle: 'From pumps and filters to heating systems and automation, we supply and install the latest pool equipment to keep your pool running smoothly.',
      bgImageUrl: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1920&q=80',
      tabs: [
        {
          label: 'Why Renovate Your Pool?',
          type: 'paragraph',
          content: 'Over time, pools can develop cracks, outdated finishes, or inefficient systems. A renovation enhances both aesthetics and functionality, making your pool safer, more efficient, and visually stunning.'
        },
        {
          label: 'Our Pool Renovation Services',
          type: 'points',
          content: [
            'Resurfacing & Tiling: Upgrade worn-out finishes with high-quality tiles, pebblecrete, or quartz.‍',
            'Structural Repairs: Fix cracks, leaks, or damaged pool shells to restore durability.‍',
            'Pool Equipment Upgrades: Install modern pumps, filters, and heating systems for efficiency.‍',
            'Modern Design Enhancements: Add water features, LED lighting, or a new shape to refresh your pool’s look.'
          ]},
        {
          label: 'Our Process',
          type: 'points',
          content: [
            'Assessment & Consultation – We inspect your pool and discuss renovation goals.‍',
            'Custom Design Plan – We create a tailored solution that suits your needs and budget.‍',
            'Renovation & Installation – Our skilled team handles all upgrades and improvements.‍',
            'Final Inspection & Handover – We ensure quality and customer satisfaction before completion.'
          ]
        }
      ]
    },
    sectionOne: {
      title: 'Design Build Details',
      paragraph: 'From the first design concept to the final finishing details, we manage every stage of your pool project with care, quality materials, and a clear process.',
      bgImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1920&q=80',
      sideImageUrl: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1000&q=80',
      fourParagraphs: [
        'Attention to Detail\nEvery detail is considered with care  from the pool layout and materials to the final finish  creating a result that feels precise, polished, and built to last.',
        'Innovative Solution\nsWe use modern pool systems, smart equipment, and considered design solutions to create a pool that feels efficient, functional, and built for today’s lifestyle.',
        'Built for Longevity\nWe use quality materials, trusted construction methods, and durable finishes to create pools that are made to perform beautifully for years to come.',
        'Seamless Experience\nWe keep the process clear and well-managed, with transparent communication and steady guidance from the first conversation through to completion.'
      ]
    },
    sectionTwo: {
  title: 'Everything You Need to Know',
      bgImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80',
      faqs: [
        { question: 'How long does new pool construction take?', answer: 'Most custom shotcrete pools require 8 to 12 weeks depending on site access and structural complexity.' },
        { question: 'What is included in the new pool construction service?', answer: 'Yes, we handle all engineering submissions, environmental zoning clearances, and construction permits.' },
        { question: 'Can I customise the shape and features of my pool?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' },
        { question: 'Do you handle permits and approvals?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' },
        { question: 'How do I get started with a new pool build?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' }
      ]
    }
  },

  'commercial-pool-construction': {
    slug: 'commercial-pool-construction',
    hero: {
      title: 'Commercial Pool Construction',
      subtitle: 'Breathing New Life',
      bgImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80',
      tabs: [
        {
          label: 'Why Choose Us ',
          type: 'paragraph',
          content: 'Commercial pools require advanced planning, engineering, and compliance with safety standards. Our team specialises in delivering high-quality, fully compliant pools tailored to your business needs.'
        },
        {
          label: 'Our Commercial Pool Services',
          type: 'points',
          content: [
            'Custom Design & Engineering: Tailored solutions to fit your facility and vision.‍',
            'Structural Integrity & Safety Compliance: Pools built to meet industry regulations.‍',
            'Advanced Filtration & Sanitation Systems: Ensuring optimal water quality for high usage.‍',
            'Luxury Features & Smart Technology: Infinity edges, water jets, LED lighting, and automated systems.'
          ]
        },
        {
          label: 'Our Construction Process',
          type: 'points',
          content: [
            'Consultation & Planning – We assess your space and project requirements.‍',
            'Design & Engineering – Customised designs ensuring durability and compliance.‍',
            'Construction & Installation – Built with high-quality materials and expert craftsmanship.‍',
            'Final Testing & Approval – We conduct thorough safety checks before handover.'
          ]
        }
      ]
    },
    sectionOne: {
      title: 'Design Build Details',
      paragraph: 'From the first design concept to the final finishing details, we manage every stage of your pool project with care, quality materials, and a clear process.',
      bgImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1920&q=80',
      sideImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      fourParagraphs: [
        'Attention to Detail\nEvery detail is considered with care  from the pool layout and materials to the final finish  creating a result that feels precise, polished, and built to last.',
        'Innovative Solution\nsWe use modern pool systems, smart equipment, and considered design solutions to create a pool that feels efficient, functional, and built for today’s lifestyle.',
        'Built for Longevity\nWe use quality materials, trusted construction methods, and durable finishes to create pools that are made to perform beautifully for years to come.',
        'Seamless Experience\nWe keep the process clear and well-managed, with transparent communication and steady guidance from the first conversation through to completion.'
      ]
    },
    sectionTwo: {
      title: 'Everything You Need to Know',
      bgImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80',
      faqs: [
        { question: 'How long does new pool construction take?', answer: 'Most custom shotcrete pools require 8 to 12 weeks depending on site access and structural complexity.' },
        { question: 'What is included in the new pool construction service?', answer: 'Yes, we handle all engineering submissions, environmental zoning clearances, and construction permits.' },
        { question: 'Can I customise the shape and features of my pool?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' },
        { question: 'Do you handle permits and approvals?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' },
        { question: 'How do I get started with a new pool build?', answer: 'While possible, integrating automation arrays during initial plumbing runs reduces execution costs significantly.' }
      ]
    }
  }
};