import {BookIcon, SparklesIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  icon: BookIcon,
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'curriculum', title: 'Curriculum'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'overview',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      group: 'overview',
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'overview',
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
      name: 'level',
      type: 'string',
      group: 'overview',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      group: 'overview',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'popular',
      title: 'Popular course',
      type: 'boolean',
      group: 'overview',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      title: 'Student count',
      type: 'number',
      group: 'overview',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'learningOutcomes',
      title: "What you'll learn",
      type: 'array',
      group: 'overview',
      of: [
        defineArrayMember({
          name: 'learningOutcome',
          title: 'Learning outcome',
          type: 'object',
          icon: SparklesIcon,
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon name',
              type: 'string',
              options: {
                list: [
                  {title: 'Code', value: 'code'},
                  {title: 'Layers', value: 'layers'},
                  {title: 'Rocket', value: 'rocket'},
                  {title: 'Sparkles', value: 'sparkles'},
                  {title: 'Target', value: 'target'},
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required().max(120),
            }),
            defineField({
              name: 'description',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required().max(280),
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'description'},
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: 'instructor',
      type: 'reference',
      group: 'overview',
      to: [{type: 'instructor'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      group: 'overview',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'modules',
      type: 'array',
      group: 'curriculum',
      of: [defineArrayMember({type: 'module'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'instructor.name', media: 'coverImage'},
    prepare({title, subtitle, media}) {
      return {title, subtitle: subtitle ? `by ${subtitle}` : 'Instructor not set', media}
    },
  },
})
