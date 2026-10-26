export const contactEmail = 'hailegebrielsamuel@gmail.com';

export function normalizeContact(values = {}) {
  return Object.fromEntries(
    ['name', 'email', 'service', 'message', 'website'].map((key) => [
      key,
      typeof values[key] === 'string' ? values[key].trim() : '',
    ]),
  );
}

export function validateContact(values) {
  const errors = {};
  if (
    values.name.length < 2 ||
    values.name.length > 100 ||
    /[\r\n]/.test(values.name)
  )
    errors.name = 'Enter a name between 2 and 100 characters.';
  if (
    !/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(values.email) ||
    values.email.length > 254
  )
    errors.email = 'Enter a valid email address.';
  if (values.message.length < 20 || values.message.length > 5000)
    errors.message = 'Tell me a little more — between 20 and 5,000 characters.';
  if (values.service.length > 100 || /[\r\n]/.test(values.service))
    errors.service = 'Choose a valid project type.';
  return errors;
}

export function buildContactDraft(values) {
  const subject = `Project inquiry: ${values.service || 'Let’s collaborate'}`;
  const body = `Hi Hailegebriel,\n\n${values.message}\n\nProject type: ${values.service || 'Let’s explore'}\n\nFrom: ${values.name}\nReply to: ${values.email}`;
  return {
    subject,
    body,
    href: `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
