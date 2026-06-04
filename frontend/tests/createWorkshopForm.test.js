import { describe, it, expect } from 'vitest';
import {
  buildWorkshopPayload,
  getWorkshopSubmitErrorMessage,
  submitWorkshopForm,
} from '../src/pages/createWorkshopForm.js';

const baseForm = {
  title: ' Applied Digital Pedagogy ',
  category: 'Data Science',
  description: ' Classroom methods with practical data exercises. ',
  coordinatorName: ' Tina Teacher ',
  coordinatorBio: ' Teacher educator. ',
  startsAt: '2026-09-01',
  endsAt: '2026-09-10',
  duration: ' 12 hours ',
  capacity: '24',
  location: ' Online ',
};

const translations = {
  'create.errorGeneric': 'Workshop-ul nu a putut fi salvat.',
};

function t(key) {
  return translations[key] ?? key;
}

describe('create workshop form', () => {
  it('builds a draft payload from trimmed form values', () => {
    expect(buildWorkshopPayload(baseForm, 'draft')).toEqual({
      title: 'Applied Digital Pedagogy',
      category: 'Data Science',
      description: 'Classroom methods with practical data exercises.',
      coordinator_name: 'Tina Teacher',
      coordinator_bio: 'Teacher educator.',
      starts_at: '2026-09-01',
      ends_at: '2026-09-10',
      duration: '12 hours',
      capacity: 24,
      location: 'Online',
      status: 'draft',
    });
  });

  it('builds a published payload and omits empty optional values', () => {
    expect(buildWorkshopPayload({
      ...baseForm,
      coordinatorName: '',
      coordinatorBio: '',
      startsAt: '',
      endsAt: '',
      duration: '',
      capacity: '',
      location: '',
    }, 'published')).toEqual({
      title: 'Applied Digital Pedagogy',
      category: 'Data Science',
      description: 'Classroom methods with practical data exercises.',
      status: 'published',
    });
  });

  it('submits with a token and returns visible success state', async () => {
    const calls = [];

    const result = await submitWorkshopForm({
      form: baseForm,
      status: 'draft',
      getToken: async () => 'teacher-token',
      createWorkshop: async (token, payload) => {
        calls.push([token, payload]);

        return {
          workshop: {
            id: 7,
            title: payload.title,
            status: payload.status,
          },
        };
      },
      t,
    });

    expect(calls[0][0]).toBe('teacher-token');
    expect(calls[0][1].status).toBe('draft');
    expect(result).toEqual({
      errorMessage: '',
      workshop: {
        id: 7,
        title: 'Applied Digital Pedagogy',
        status: 'draft',
      },
    });
  });

  it('maps the first backend validation error to inline error text', () => {
    expect(getWorkshopSubmitErrorMessage({
      payload: {
        errors: {
          title: ['Titlul este obligatoriu.'],
          status: ['Status invalid.'],
        },
      },
    }, t)).toBe('Titlul este obligatoriu.');
  });

  it('uses a generic inline error when no validation message exists', () => {
    expect(getWorkshopSubmitErrorMessage(new Error('Network failed'), t)).toBe('Workshop-ul nu a putut fi salvat.');
  });
});
