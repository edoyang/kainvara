import { BsCalendar4, BsPerson } from 'react-icons/bs'
import { useParams } from 'react-router-dom'
import { PostCard } from '../components/blog/PostCard.tsx'
import { Seo } from '../components/Seo.tsx'
import { Breadcrumb } from '../components/ui/Breadcrumb.tsx'
import { ButtonLink } from '../components/ui/Button.tsx'
import { EmptyState, ErrorState, PageLoader } from '../components/ui/States.tsx'
import { useQuery } from '../hooks/useQuery.ts'
import { api } from '../lib/api.ts'
import { formatDate, img, imgSet } from '../lib/format.ts'
import { articleData, breadcrumbData } from '../lib/structuredData.ts'
import type { Post } from '../types.ts'

interface PostResponse {
  post: Post
  more: Post[]
}

export default function BlogPost() {
  const { slug = '' } = useParams()
  const path = `/posts/${encodeURIComponent(slug)}`
  const { data, error, reload } = useQuery(path, (signal) => api<PostResponse>(path, { signal }))
  const post = data?.post

  return (
    <>
      <Seo
        title={post ? post.title : 'Blog'}
        description={post?.excerpt}
        image={post ? img(post.image, 1200, 630) : undefined}
        type={post ? 'article' : 'website'}
        noindex={Boolean(error) && !post}
        jsonLd={
          post && [
            articleData(post),
            breadcrumbData([
              { name: 'Blog', path: '/blog' },
              { name: post.title, path: `/blog/${post.slug}` },
            ]),
          ]
        }
      />

      <section className="bg-gray-1">
        <div className="container-x py-6">
          <Breadcrumb
            items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, ...(post ? [{ label: post.title }] : [])]}
          />
        </div>
      </section>

      {error && !data ? (
        error === 'Post not found' ? (
          <EmptyState
            title="We could not find that post"
            message="It may have been moved or removed."
            action={<ButtonLink to="/blog">Back to the blog</ButtonLink>}
          />
        ) : (
          <ErrorState message={error} onRetry={reload} />
        )
      ) : !post ? (
        <PageLoader />
      ) : (
        <>
          <article className="bg-white">
            <div className="container-x py-12">
              <div className="mx-auto max-w-[760px]">
                <ul className="flex flex-wrap gap-[15px] text-small">
                  {post.tags.map((tag, index) => (
                    <li key={tag} className={index === 0 ? 'text-primary' : 'text-body'}>
                      {tag}
                    </li>
                  ))}
                </ul>
                <h1 className="mt-4 text-h2">{post.title}</h1>
                <p className="mt-4 text-h4">{post.excerpt}</p>
                <p className="mt-6 flex flex-wrap items-center gap-6 text-small">
                  <span className="flex items-center gap-[5px]">
                    <BsPerson size={16} className="text-primary" aria-hidden />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-[5px]">
                    <BsCalendar4 size={16} className="text-primary" aria-hidden />
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  </span>
                </p>
              </div>

              <img
                src={img(post.image, 1100, 560)}
                srcSet={imgSet(post.image, 1100, 560)}
                alt={post.title}
                fetchPriority="high"
                className="mt-10 h-[260px] w-full rounded-[5px] object-cover sm:h-[480px]"
              />

              <div className="mx-auto mt-10 flex max-w-[760px] flex-col gap-6 text-[16px] leading-7 text-body">
                {(post.body ?? []).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </article>

          {data.more.length > 0 && (
            <section className="bg-gray-1">
              <div className="container-x flex flex-col gap-12 py-20">
                <h2 className="text-center text-h3">KEEP READING</h2>
                <ul className="grid gap-[30px] md:grid-cols-2 lg:grid-cols-3">
                  {data.more.map((item) => (
                    <li key={item.id}>
                      <PostCard post={item} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
