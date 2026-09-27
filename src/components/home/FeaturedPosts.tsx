import { usePosts } from '../../hooks/useCatalog.ts'
import { PostCard, PostCardSkeleton } from '../blog/PostCard.tsx'
import { SectionHeading } from '../ui/SectionHeading.tsx'
import { ErrorState } from '../ui/States.tsx'

export function FeaturedPosts() {
  const { data, error, reload } = usePosts(3)

  return (
    <section className="bg-white py-[112px]">
      <div className="container-x flex flex-col gap-20">
        <SectionHeading
          eyebrow="From the Journal"
          eyebrowTone="primary"
          title="Featured Posts"
          size="h2"
          text="Style guides, care tips and stories from inside the studio."
        />
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <ul className="grid gap-[30px] md:grid-cols-2 lg:grid-cols-3">
            {data
              ? data.items.map((post) => (
                  <li key={post.id}>
                    <PostCard post={post} />
                  </li>
                ))
              : [0, 1, 2].map((key) => (
                  <li key={key}>
                    <PostCardSkeleton />
                  </li>
                ))}
          </ul>
        )}
      </div>
    </section>
  )
}
