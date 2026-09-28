import { AiOutlineAreaChart } from 'react-icons/ai'
import { BsCalendar4, BsChevronRight } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { cx, formatDate, img, imgSet, plural } from '../../lib/format.ts'
import type { Post } from '../../types.ts'
import { Skeleton } from '../ui/States.tsx'

// The kit's "Content card": 300px cover, tags, title, excerpt, meta, link.
export function PostCard({ post }: { post: Post }) {
  const href = `/blog/${post.slug}`
  return (
    <article className="group flex h-full flex-col bg-white shadow-light">
      <div className="relative h-[300px] overflow-hidden bg-gray-2">
        <Link to={href} tabIndex={-1} aria-hidden>
          <img
            src={img(post.image, 400, 345)}
            srcSet={imgSet(post.image, 400, 345)}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {post.badge && (
          <span className="absolute top-5 left-5 rounded-[3px] bg-danger px-2.5 text-h6 text-white shadow-light">
            {post.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-[25px] pt-[25px] pb-[35px]">
        <ul className="flex flex-wrap gap-[15px] text-small">
          {post.tags.map((tag, index) => (
            <li key={tag} className={cx(index === 0 ? 'text-disabled' : 'text-body')}>
              {tag}
            </li>
          ))}
        </ul>
        <h3 className="text-h4 text-ink">
          <Link to={href} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        <p className="text-p">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-2.5 py-[15px] text-small">
          <span className="flex items-center gap-[5px]">
            <BsCalendar4 size={16} className="text-primary" aria-hidden />
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </span>
          <span className="flex items-center gap-[5px]">
            <AiOutlineAreaChart size={16} className="text-secondary" aria-hidden />
            {plural(post.commentCount, 'comment')}
          </span>
        </div>
        <Link to={href} className="flex items-center gap-2.5 text-h6 text-body hover:text-primary">
          Learn More
          <BsChevronRight size={14} className="text-primary" aria-hidden />
          <span className="sr-only">about {post.title}</span>
        </Link>
      </div>
    </article>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="bg-white shadow-light">
      <Skeleton className="h-[300px] rounded-none" />
      <div className="flex flex-col gap-3 px-[25px] pt-[25px] pb-[35px]">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
