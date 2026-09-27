import { useSearchParams } from 'react-router-dom'
import { PostCard, PostCardSkeleton } from '../components/blog/PostCard.tsx'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { Pagination } from '../components/ui/Pagination.tsx'
import { SectionHeading } from '../components/ui/SectionHeading.tsx'
import { ErrorState } from '../components/ui/States.tsx'
import { usePosts } from '../hooks/useCatalog.ts'
import { pageTitle } from '../lib/site.ts'

export default function Blog() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Math.floor(Number(params.get('page')) || 1))
  const { data, error, reload } = usePosts(6, page)

  return (
    <>
      <title>{pageTitle('Blog')}</title>
      <PageHeader title="Blog" crumbs={[{ label: 'Blog' }]} />

      <section className="bg-white">
        <div className="container-x flex flex-col gap-20 py-20">
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
                : Array.from({ length: 6 }, (_, index) => (
                    <li key={index}>
                      <PostCardSkeleton />
                    </li>
                  ))}
            </ul>
          )}
          {data && (
            <Pagination
              page={data.page}
              pages={data.pages}
              onChange={(next) => {
                setParams(next > 1 ? { page: String(next) } : {})
                window.scrollTo({ top: 0 })
              }}
            />
          )}
        </div>
      </section>
    </>
  )
}
