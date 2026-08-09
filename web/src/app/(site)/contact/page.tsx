import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { RevealController } from '@/components/shared/RevealController.client'

import { ContactInfo } from '@/components/contact/ContactInfo'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Vana Ekantha',
  description: 'Phone, email, and location for Vana Ekantha, plus a contact form for general enquiries.',
}

export default async function ContactPage() {
  const { data: contact, error } = await safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'contact', depth: 1 }))

  if (!contact) {
    return <CmsNotConnected what={`the Contact page${error ? ` (${error})` : ''}`} />
  }

  return (
    <>
      <RevealController />
      <ContactInfo data={contact.info} />
      <ContactForm data={contact.form} />
    </>
  )
}
