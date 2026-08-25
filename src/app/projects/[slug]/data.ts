export interface InfoSlide {
  title: string;
  description: string;
  image: string;
}

export interface FullServiceData {
  title: string;
  category: string;
  description: string;
  images: string[];
  slides: InfoSlide[];
}

export const GRAND_POOLS_DATA: Record<string, FullServiceData> = {
  "kooyong-rd-toorak": {
    title: "Kooyong Rd Toorak",
    category: "Custom Concrete Pool",
    description: "A refined architectural pool designed with privacy, structure, and timeless detail in mind. Set within a premium Toorak residence, this project combines a raised pool form, dark mosaic finishes, soft stone surfaces, and layered landscaping to create a calm, private outdoor retreat.",
    images: [
      "/kooyong/hero.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
    ],
    slides: [
      {
        title: "Consultation & Site Review",
        description: "We start by understanding your space, goals, and what you want from the pool. Our team reviews the site, access, layout, and key project requirements. This gives us a clear direction before design begins.",
        image: "/placeholder.webp"
      },
      {
        title: "Design & Planning",
        description: "Your pool concept is shaped around the home, landscape, and daily use. We define the layout, finishes, features, and practical details. The result is a clear plan before construction starts.",
        image: "/placeholder.webp"
      },
      {
        title: "Approvals & Preparation",
        description: "Before building begins, we prepare the required details and documentation. This stage helps align the project, schedule, access, and technical needs. Everything is organised so construction can move forward smoothly.",
        image: "/placeholder.webp"
      },
      {
        title: "Construction & Installation",
        description: "This is where the pool starts taking shape on site. Our team manages excavation, structure, plumbing, equipment, and installation. Every step is handled with precision and long-term durability in mind.",
        image: "/placeholder.webp"
      },
      {
        title: "Finishing & Installation",
        description: "Final finishes, equipment checks, water balance, and detailing are completed. We make sure everything is ready, clean, and working properly. Then we guide you through how to use and care for your new pool.",
        image: "/placeholder.webp"
      }
    ]
  },
  "dennett-st-carrum": {
    title: "Dennett St Carrum",
    category: "Family Sanctuary",
    description: "Designed for relaxation and play, this expansive backyard oasis balances child-friendly functionality with contemporary aesthetics.",
    images: [
      "/dennetthero.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
    ],
    slides: [
      {
        title: "Consultation & Site Review",
        description: "Evaluating family lifestyle needs and site dimensions to layout an inviting, safe, and functional backyard pool environment.",
        image: "/placeholder.webp"
      },
      {
        title: "Design & Planning",
        description: "Balancing shallow play steps, swim zones, and surrounding alfresco entertaining decks into a single master layout.",
        image:"/placeholder.webp"
      },
      {
        title: "Approvals & Preparation",
        description: "Careful soil removal and soil stabilization tailored specifically for coastal terrain and deep foundation requirements.",
        image: "/placeholder.webp"
      },
      {
        title: "Construction & Installation",
        description: "Precision steel fixing and high-density concrete spraying form the robust foundation built for decades of family fun.",
        image: "/placeholder.webp"
      },
      {
        title: "Finishing & Installation",
        description: "Finishing touches including timber decking, perimeter fencing, energy-efficient heat pumps, and water balance testing.",
        image:"/placeholder.webp"
      }
    ]
  },
  "murray-st-prahran": {
    title: "Murray St Prahran",
    category: "Architectural Plunge",
    description: "Maximising urban space, this compact plunge pool features high-end custom tilework and space-efficient engineering.",
    images: [
      "/murray.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
    ],
    slides: [
      {
        title: "Consultation & Site Review",
        description: "Assessing tight urban access constraints, boundary easements, and adjacent structures for precise micro-plunge installation.",
        image: "/placeholder.webp"
      },
      {
        title: "Design & Planning",
        description: "Optimising every millimeter of the inner courtyard to incorporate swim jets, bench seating, and minimalist aesthetics.",
        image: "/placeholder.webp"
      },
      {
        title: "Approvals & Preparation",
        description: "Utilising compact machinery and custom rigging techniques to negotiate zero-lot-line urban property boundaries.",
        image: "/placeholder.webp"
      },
      {
        title: "Construction & Installation",
        description: "Engineered shotcrete shell pour creating a dense, watertight structure optimized for intimate urban spaces.",
        image: "/placeholder.webp"
      },
      {
        title: "Finishing & Installation",
        description: "Hand-laid mosaic tiles, warm accent LED lighting, and discreet hidden equipment equipment rooms finalize the build.",
        image: "/placeholder.webp"
      }
    ]
  },
  "reay-rd-mooroolbark": {
    title: "Reay Rd Mooroolbark",
    category: "Residential Oasis",
    description: "Framed by lush natural landscaping, this resort-style pool delivers a tranquil retreat right at home.",
    images: [
      "/reayhero.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
    ],
    slides: [
      {
        title: "Consultation & Site Review",
        description: "Analysing natural slope grade, sun orientation, and existing flora to blend the pool organically with the landscape.",
        image: "/placeholder.webp"
      },
      {
        title: "Design & Planning",
        description: "Designing infinity edges and natural stone coping that transition smoothly into the surrounding garden scenery.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1920&auto=format&fit=crop"
      },
      {
        title: "Approvals & Preparation",
        description: "Terraced excavation and custom retaining walls engineered to handle sloping ground conditions and soil pressures.",
        image: "/placeholder.webp"
      },
      {
        title: "Construction & Installation",
        description: "Heavy-duty concrete spray application forming elevated beam edges and sunken lounge seating areas.",
        image: "/placeholder.webp"
      },
      {
        title: "Finishing & Installation",
        description: "Installing organic bluestone paving, mineral salt filtration systems, and lush perimeter planting.",
        image: "/placeholder.webp"
      }
    ]
  },
  "the-como-toorak": {
    title: "‘The Como’ Toorak",
    category: "Luxury Showcase",
    description: "An elegant centerpiece featuring state-of-the-art water filtration, ambient lighting, and bespoke architectural surrounds.",
    images: [
      "/toorak.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
      "/placeholder.webp",
    ],
    slides: [
      {
        title: "Consultation & Site Review",
        description: "Comprehensive site evaluation and collaboration with lead architects to establish ultra-luxury specifications.",
        image: "/placeholder.webp"
      },
      {
        title: "Design & Planning",
        description: "Integrating flush knife-edge perimeter overflows, hidden balance tanks, and fully automated water management systems.",
        image:"/placeholder.webp"
      },
      {
        title: "Approvals & Preparation",
        description: "Deep foundation works with specialized underpinning to protect surrounding high-end residential structures.",
        image: "/placeholder.webp"
      },
      {
        title: "Construction & Installation",
        description: "Custom timber shuttering and high-strength concrete formulations crafted to millimeter tolerances.",
        image: "/placeholder.webp"
      },
      {
        title: "Finishing & Installation",
        description: "Imported Italian glass tiles, climate-controlled heating, submerged sound systems, and automated cover integration.",
        image:"/placeholder.webp"
      }
    ]
  }
};