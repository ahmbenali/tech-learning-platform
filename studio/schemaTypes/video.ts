import { defineArrayMember, defineField, defineType } from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  // Internal document — built by the ingestion pipeline, not authored in Studio
  hidden: true,
  fields: [
    defineField({
      name: 'id',
      title: 'Video ID',
      type: 'string',
      readOnly: true,
      description: 'Derived from the video URL, special characters stripped',
    }),
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      readOnly: true,
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      description: 'Table of contents from the video provider',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'startSeconds', title: 'Start (seconds)', type: 'number' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'chunks',
      title: 'Transcript Chunks',
      type: 'array',
      description: 'Timestamped transcript pieces — never stored as one block',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'startSeconds', title: 'Start (seconds)', type: 'number' }),
            defineField({ name: 'text', title: 'Text', type: 'text' }),
          ],
        }),
      ],
    }),
  ],
})
