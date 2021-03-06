import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import SubmitForm from './submit-form';

const languages = [{
  id: 'en',
  name: 'English',
  nativeName: 'English',
}, {
  id: 'de',
  name: 'German',
  nativeName: 'Deutsch',
}];

const sentences = [
  'This is a test.',
  'This as well!',
  'I am also a test.',
];

const source = 'Test';

test('should render submit button', () => {
  render(<SubmitForm languages={languages}/>);
  expect(screen.getByText('Submit')).toBeTruthy();
});

test('should render message', () => {
  const message = 'Hi';
  render(<SubmitForm languages={languages} message={message}/>);
  expect(screen.getByText(message)).toBeTruthy();
});

test('should render error', () => {
  const error = 'Oh no!';
  render(<SubmitForm languages={languages} error={error}/>);
  expect(screen.getByText(error)).toBeTruthy();
});

test('should submit form if valid', async () => {
  const onSubmit = jest.fn();

  render(<SubmitForm languages={languages} onSubmit={onSubmit}/>);

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });
  fireEvent.input(screen.getByRole('textbox', { name: /Add public domain sentences/i }), { target: { value: sentences.join('\n') }});
  fireEvent.input(screen.getByRole('textbox', { name: /Where are these public domain sentences from?/i }), { target: { value: source }});
  await userEvent.click(screen.getByText(/confirm that these sentences/));

  await userEvent.click(screen.getByText('Submit'));
  expect(onSubmit).toHaveBeenCalledWith({
    language: 'en',
    sentences,
    source,
  });
});

test('should show error if no language', async () => {
  const onSubmit = jest.fn();

  render(<SubmitForm languages={languages} onSubmit={onSubmit}/>);

  await userEvent.click(screen.getByText('Submit'));
  expect(onSubmit.mock.calls.length).toBe(0);
  expect(screen.getByText('Please select a language.')).toBeTruthy();
});

test('should show error if no sentences', async () => {
  const onSubmit = jest.fn();

  render(<SubmitForm languages={languages} onSubmit={onSubmit}/>);

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });

  await userEvent.click(screen.getByText('Submit'));
  expect(onSubmit.mock.calls.length).toBe(0);
  expect(screen.getByText('Please add sentences.')).toBeTruthy();
});

test('should show error if no source', async () => {
  const onSubmit = jest.fn();

  render(<SubmitForm languages={languages} onSubmit={onSubmit}/>);

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });
  fireEvent.input(screen.getByRole('textbox', { name: /Add public domain sentences/i }), { target: { value: sentences.join('\n') }});

  await userEvent.click(screen.getByText('Submit'));
  expect(onSubmit.mock.calls.length).toBe(0);
  expect(screen.getByText('Please add a source.')).toBeTruthy();
});

test('should show error if not confirmed', async () => {
  const onSubmit = jest.fn();

  render(<SubmitForm languages={languages} onSubmit={onSubmit}/>);

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'en' } });
  fireEvent.input(screen.getByRole('textbox', { name: /Add public domain sentences/i }), { target: { value: sentences.join('\n') }});
  fireEvent.input(screen.getByRole('textbox', { name: /Where are these public domain sentences from?/i }), { target: { value: source }});

  await userEvent.click(screen.getByText('Submit'));
  expect(onSubmit.mock.calls.length).toBe(0);
  expect(screen.getByText('Please confirm that these sentences are public domain.')).toBeTruthy();
});

test('should render failures', () => {
  const sentenceSubmissionFailures = {
    'Too long': ['Oh no I am too long', 'Oh no I am too long too'],
    'Invalid symbol': ['I have a % symbol'],
  };

  render(
    <BrowserRouter>
      <SubmitForm languages={languages} sentenceSubmissionFailures={sentenceSubmissionFailures}/>
    </BrowserRouter>
  );
  expect(screen.getByText('Too long')).toBeTruthy();
  expect(screen.getByText('Oh no I am too long')).toBeTruthy();
  expect(screen.getByText('Oh no I am too long too')).toBeTruthy();
  expect(screen.getByText('Invalid symbol')).toBeTruthy();
  expect(screen.getByText('I have a % symbol')).toBeTruthy();
});
