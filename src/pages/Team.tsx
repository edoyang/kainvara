import { InnerTitle } from '../components/inner/InnerTitle.tsx'
import { TeamGrid, TrialCta } from '../components/inner/Sections.tsx'
import { img, imgSet } from '../lib/format.ts'
import { media, pageTitle, site } from '../lib/site.ts'

// The kit's "desktop-hero-picture-1": one large photo and four small ones.
function Collage() {
  const [main, ...rest] = media.teamCollage
  return (
    <section className="bg-white" aria-label={`Life at ${site.name}`}>
      <div className="mx-auto grid max-w-[1440px] gap-2.5 lg:grid-cols-[700fr_731fr]">
        <img
          src={img(main, 900, 680)}
          srcSet={imgSet(main, 900, 680)}
          alt="The team in the studio"
          fetchPriority="high"
          className="h-[530px] w-full object-cover"
        />
        <div className="grid grid-cols-2 gap-2.5">
          {rest.map((image, index) => (
            <img
              key={image}
              src={img(image, 480, 340)}
              srcSet={imgSet(image, 480, 340)}
              alt={`Team at work, photo ${index + 2}`}
              loading="lazy"
              className="h-[156px] w-full object-cover sm:h-[260px]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Team() {
  return (
    <>
      <title>{pageTitle('Our team')}</title>
      <InnerTitle eyebrow="What we do" title="Innovation tailored for you" crumb="Team" />
      <Collage />
      <TeamGrid count={9} />
      <TrialCta />
    </>
  )
}
