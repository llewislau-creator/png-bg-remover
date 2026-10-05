const IMAGE_TO_PDF_URL = 'https://imagetopdf-ggrxyv8w.manus.space/'
const entry = document.getElementById('png-cutout-entry')

if (entry) {
  const venus = [...entry.querySelectorAll('.function-planet')].find((planet) =>
    (planet.getAttribute('aria-label') || '').toUpperCase().startsWith('VENUS:')
  )

  if (venus) {
    venus.dataset.externalTool = 'image-to-pdf'
    venus.setAttribute('aria-label', 'VENUS: IMAGE TO PDF')

    const title = venus.querySelector('.planet-label b')
    const meta = venus.querySelector('.planet-label span')
    if (title) title.textContent = '03 / IMAGE TO PDF'
    if (meta) meta.textContent = 'VENUS · OPEN TOOL'

    venus.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      window.location.assign(IMAGE_TO_PDF_URL)
    }, true)
  }
}
