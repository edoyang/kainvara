import { InnerHero } from '../components/inner/InnerHero.tsx'
import { Stats, TeamGrid, VideoSection, WhatYouGet, WorkWithUs } from '../components/inner/Sections.tsx'
import { Seo } from '../components/Seo.tsx'
import { ButtonLink } from '../components/ui/Button.tsx'
import { media, site } from '../lib/site.ts'
import { breadcrumbData } from '../lib/structuredData.ts'

export default function About() {
  return (
    <>
      <Seo
        title="About us"
        description="Kainvara is a fashion store for clothing, shoes and accessories chosen to be worn often and kept for years. Read our story and meet the team."
        jsonLd={breadcrumbData([{ name: 'About us', path: '/about' }])}
      />
      <InnerHero
        eyebrow="About company"
        title="ABOUT US"
        text="Clothing, shoes and accessories chosen to be worn often and kept for years."
        image={media.aboutHero}
        imageAlt="Shopper carrying bags from the new collection"
      >
        <ButtonLink to="/contact">Get In Touch</ButtonLink>
      </InnerHero>

      {/* The kit's "desktop-content-9" */}
      <section className="bg-white">
        <div className="container-x grid items-center gap-[60px] py-6 lg:grid-cols-[394fr_545fr] lg:px-10">
          <div className="flex flex-col gap-6 py-6 text-center lg:text-left">
            <p className="text-p text-danger">Our story</p>
            <h2 className="text-h3">The name comes from kain, the Indonesian word for cloth.</h2>
          </div>
          <p className="text-center text-p lg:text-left">
            {site.name} is a portfolio project, designed and built end to end by {site.owner.name}, a software
            engineer based in Sydney. The storefront, the accounts, the cart and the checkout all run for real.
            The orders are demonstrations, so nothing is charged and nothing is shipped.
          </p>
        </div>
      </section>

      <Stats />
      <VideoSection />
      <TeamGrid count={3} text="A small team with one shared habit: we only stock what we would wear ourselves." />
      <WhatYouGet />
      <WorkWithUs />
    </>
  )
}
