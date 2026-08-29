import {PlayIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const lesson = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({scheme: ['https']}).error('Use an HTTPS video URL.'),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Poster or thumbnail',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required().max(160),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationSeconds',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'freePreview',
      title: 'Free preview',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      title: 'Student count',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'notes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading 2', value: 'h2'},
            {title: 'Heading 3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (rule) => rule.required().uri({scheme: ['https']}),
                  }),
                ],
              },
            ],
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'keyPoints',
      title: 'In this lesson you will',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: 'proTip',
      title: 'Pro tip',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: 'resources',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'resource',
          title: 'Resource',
          type: 'object',
          fields: [
            defineField({
              name: 'type',
              type: 'string',
              options: {
                list: [
                  {title: 'Article', value: 'article'},
                  {title: 'Code', value: 'code'},
                  {title: 'Download', value: 'download'},
                  {title: 'Link', value: 'link'},
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: 'description',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required().max(320),
            }),
            defineField({
              name: 'url',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['https']}),
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'type'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'durationSeconds', media: 'thumbnail'},
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle ? `${Math.round(subtitle / 60)} min` : 'Duration not set',
        media,
      }
    },
  },
})
