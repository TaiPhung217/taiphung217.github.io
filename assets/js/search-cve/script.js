var apiData = null,
  loadingElement = document.getElementById('loading'),
  searchForm = document.querySelector('.search-content__form'),
  searchInput = document.getElementById('search')
async function fetchData() {
  try {
    loadingElement.style.display = 'block'
    searchForm.style.display = 'none'
    const _0x52d72b = await fetch(
      'https://raw.githubusercontent.com/nomi-sec/PoC-in-GitHub/master/README.md'
    )
    if (!_0x52d72b.ok) {
      throw new Error('Network response was not ok.')
    }
    apiData = await _0x52d72b.text()
    apiData &&
      ((loadingElement.style.display = 'none'),
      (searchForm.style.display = 'block'),
      processData(apiData))
  } catch (_0x327ef4) {
    console.error(_0x327ef4)
  }
}
function processData(_0x4610e5) {
  const _0x42a8ff = [],
    _0x429146 = _0x4610e5.split('###')
  for (const _0x34e2ac of _0x429146) {
    const _0x11cd3b = /([^<]+)(?:<code>([\s\S]+?)<\/code>)?([\s\S]*)/,
      _0x35b569 = _0x34e2ac.match(_0x11cd3b)
    if (_0x35b569) {
      const _0x674efa = _0x35b569[1].trim(),
        _0x4b26bb = _0x35b569[2] ? _0x35b569[2].trim() : '',
        _0x380878 = _0x35b569[3]
          ? _0x35b569[3]
              .trim()
              .split('\n')
              .map((_0x377714) => _0x377714.trim())
          : [],
        _0x2cb9b4 = {
          title: _0x674efa,
          description: _0x4b26bb,
          links: _0x380878,
        }
      _0x42a8ff.push(_0x2cb9b4)
    } else {
      console.log('Lỗi không tìm thấy')
    }
  }
  sessionStorage.setItem('cves', JSON.stringify(_0x42a8ff))
  searchInput.value.trim() !== '' && searchCves(searchInput.value.trim())
}
function buildCVEHashTable(_0x463239) {
  const _0x2909ea = {}
  for (const _0x219304 of _0x463239) {
    const _0x1df1a9 = (_0x219304.title + _0x219304.description).toLowerCase()
    !_0x2909ea[_0x1df1a9] && (_0x2909ea[_0x1df1a9] = [])
    _0x2909ea[_0x1df1a9].push(_0x219304)
  }
  return _0x2909ea
}
function extractTitleAndLink(_0x53d532) {
  const _0x509a1c = _0x53d532.indexOf('['),
    _0x18bef5 = _0x53d532.indexOf(']'),
    _0x288226 = _0x53d532.indexOf('('),
    _0x453965 = _0x53d532.indexOf(')'),
    _0x2afc06 = _0x53d532.substring(_0x509a1c + 1, _0x18bef5),
    _0x106bda = _0x53d532.substring(_0x288226 + 1, _0x453965)
  return {
    title: _0x2afc06,
    link: _0x106bda,
  }
}
function searchCves(_0x5d655b) {
  const _0x51b3f1 = JSON.parse(sessionStorage.getItem('cves')),
    _0x1d39c6 = buildCVEHashTable(_0x51b3f1),
    _0x7bbe45 = _0x5d655b.toLowerCase().split(' ')
  if (_0x51b3f1) {
    const _0x119e82 = document.getElementById('results')
    _0x119e82.innerHTML = ''
    const _0x3452c7 = []
    for (const _0x5566dd in _0x1d39c6) {
      _0x7bbe45.every((_0x4f87db) => _0x5566dd.includes(_0x4f87db)) &&
        _0x3452c7.push(..._0x1d39c6[_0x5566dd])
    }
    const _0x375360 = _0x3452c7.length
    var _0x1c3bd7 = document.createElement('p')
    _0x1c3bd7.textContent = 'Found ' + _0x375360 + ' result for ' + _0x5d655b
    _0x119e82.appendChild(_0x1c3bd7)
    for (const _0xd7bd98 of _0x3452c7) {
      const _0x262311 = _0xd7bd98.links
          .map((_0x2519ec) => {
            const { title: _0x4b7e05, link: _0x466d71 } =
              extractTitleAndLink(_0x2519ec)
            return '<li><a href="' + _0x466d71 + '">' + _0x4b7e05 + '</a></li>'
          })
          .join(''),
        _0x5e60c9 = document.createElement('div')
      _0x5e60c9.classList.add('result-item')
      _0x5e60c9.innerHTML =
        '\n                <h3>' +
        _0xd7bd98.title +
        '</h3>\n                <p>' +
        _0xd7bd98.description +
        '</p>\n                <ul>\n                    ' +
        _0x262311 +
        '\n                </ul>\n            '
      _0x119e82.appendChild(_0x5e60c9)
    }
  }
}
!sessionStorage.getItem('cves')
  ? fetchData()
  : ((loadingElement.style.display = 'none'),
    (searchForm.style.display = 'block'))

    const currentDate = new Date().toISOString().split('T')[0];
    searchCves('Today: ' + currentDate);
    
    var searchInput = document.getElementById('search');
    searchInput.addEventListener('keydown', function (_0x4feb3a) {
      _0x4feb3a.key === 'Enter' &&
        (this.value.length > 5
          ? searchCves(this.value.trim())
          : console.log('chuỗi tìm kiếm quá ngắn'))
    })

