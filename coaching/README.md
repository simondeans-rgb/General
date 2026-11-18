# Sample Person — coaching website

A single-page site advertising career and leadership coaching. The palette is
sage and sand, chosen to feel calm, clear and sustainable.

Everything is in `index.html` (HTML, CSS and JS inline). The only other file
is the portrait in `images/`. There's no build step: open the file in a
browser, or serve it from GitHub Pages at `/coaching/`.

## Sections

Hero · Calm / Clarity / Sustainability strip · About · How I work (three
offers) · Approach (four steps) · Contact form

## Before going live

- **Photo.** `images/sample-person.jpg` is a placeholder from
  [Vitaly Gariev on Unsplash](https://unsplash.com/photos/a-professional-woman-in-a-suit-smiling-confidently-LlcpQWSWPUo)
  (Unsplash License). Swap in a real photo, ideally a 4:5 portrait about
  800×1000 px, then remove the credit from the footer.
- **Copy.** The bio, credentials, session counts and reply time are all
  placeholder text.
- **Contact form.** This is in demo mode. It validates the fields and
  shows a thank-you message, but **it does not send the enquiry anywhere.**
  To receive enquiries, create a free form at [Formspree](https://formspree.io)
  (or a similar service) and paste its URL into `FORM_ENDPOINT` near the
  top of the `<script>` block:

  ```js
  const FORM_ENDPOINT = "https://formspree.io/f/your-form-id";
  ```

  The form already posts `name`, `email`, `role`, `interest`, `message` and
  `consent`, and it includes a hidden honeypot field to block simple spam bots.
