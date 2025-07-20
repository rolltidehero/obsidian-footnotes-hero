# Test Footnotes for Backreference Synchronization

This is a test document to verify that the footnote backreference synchronization plugin works correctly with different types of footnotes.

## Numeric Footnotes

Here's a sentence with a numeric footnote[^1] to test basic functionality.

And another sentence with a second numeric footnote[^2] to ensure multiple footnotes work.

## Custom Label Footnotes

Here's a sentence with a custom label footnote[^video] to test custom label support.

And another with a different custom label[^source] to verify multiple custom labels.

## Mixed Footnotes

Here's a sentence that combines numeric[^3] and custom[^quote] footnotes in the same document.

## Special Character Labels

Testing with special characters in labels[^test-123] and underscores[^user_input].

## Multiple References

This footnote[^1] appears multiple times in the document to test reference counting.

And here it is again[^1] to verify the same footnote can be referenced multiple times.

---

[^1]: This is the first numeric footnote definition.
[^2]: This is the second numeric footnote definition.
[^video]: This is a video reference footnote with custom label.
[^source]: This is a source reference footnote with custom label.
[^3]: This is the third numeric footnote definition.
[^quote]: This is a quote reference footnote with custom label.
[^test-123]: This footnote has numbers and hyphens in the label.
[^user_input]: This footnote has underscores in the label. 