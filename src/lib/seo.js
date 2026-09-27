import { useEffect } from 'react'

export const SITE_URL = 'https://meta-collections.vercel.app'
export const SITE_NAME = 'Meta Collections'
export const DEFAULT_DESCRIPTION =
  'Store your GeoGuessr metas in one place - organize tips and tricks by region and skill level, search them, and reference them while you play.'

function setMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOgImage() {
  const image = `${SITE_URL}/og-image.png`
  setMeta('property', 'og:image', image)
  setMeta('name', 'twitter:image', image)
  setMeta('property', 'og:image:width', '1200')
  setMeta('property', 'og:image:height', '630')
}

export function usePageMeta({ title, description, type = 'website', noindex = false, image = true }) {
  useEffect(() => {
    document.title = title

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', window.location.href)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    if (image) setOgImage()
    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow')
    } else {
      setMeta('name', 'robots', 'index, follow')
    }
  }, [title, description, type, noindex, image])
}