import RNFetchBlob from 'react-native-fetch-blob'

export const crawlHtml = (html) => {
    const jpgs = getImgJpgTags(html)
    const pngs = getImgPngTags(html)
    const css = getCssTags(html)
    const js = getJsTags(html)

    //Concat all arrays into one
    const assets = [].concat.apply([], [jpgs, pngs, css, js])

    const promises = []
    assets.forEach((asset, index) => {
      const url = getSrc(asset)
      promises.push(requestDownload(url, index))
    })

    return Promise.all(promises).then((paths) => {
      paths.forEach(({ path, url }) => {
        html = html.replace(url, path)
      })
       return html
    })
}

export const requestDownload = (url, index) => {
  if (url) {
    const fileType = getFileType(url)
  //  const fileName = getFileName(url)

    return RNFetchBlob
    .config({
      fileCache : true,
      path: `sdcard/Download/article/${fileType}/file_${index}.${fileType}`
    })
    .fetch('GET', url)
    .then(res => {
      return {
        path: `${fileType}/file_${index}.${fileType}`,
        url
      }
    })
    .catch(err => console.log(err))
  }
}

const replaceRemotePath = (localPath, remotePath, html) => {
  return html.replace(remotePath, localPath)
}

const getImgJpgTags = (html) => {
  const rgxPattern = /<img[^>]+\.jpg.*?>/g
  //const rgxPattern = /<img(.*?)src\s*=\s*"(.+?)".*?>/g
  const imgRgx = new RegExp(rgxPattern)

  return html.match(imgRgx)
}

const getJsTags = (html) => {
  const rgxPattern = /<script[^>]+\.js.*?>/g
  //const rgxPattern = /<script(.*?)src\s*=\s*"(.+?)".*?>/g
  const jsRgx = new RegExp(rgxPattern)

  return html.match(jsRgx)
}

const getImgPngTags = (html) => {
  const rgxPattern = /<img[^>]+\.png.*?>/g
//  const rgxPattern = /<img(.*?)src\s*=\s*"(.+?)".*?>/g
  const imgRgx = new RegExp(rgxPattern)

  return html.match(imgRgx)
}

const getCssTags = (html) => {
  const rgxPattern = /<link[^>]+\.css.*?>/g
  //const rgxPattern = /<link(.*?)src\s*=\s*"(.+?)".*?>/g
  const cssRgx = new RegExp(rgxPattern)

  return html.match(cssRgx)
}

const getSrc = (tag) => {
  const absolutePattern = /http([\w\W]+?)[^"|^?]*/g
  const relativePattern = /uploads([\w\W]+?)[^"|^]*/g
  const absRgx = new RegExp(absolutePattern)
  const relRgx = new RegExp(relativePattern)

  if (tag) {
    return tag.match(absolutePattern) ? tag.match(absolutePattern)[0] : tag.match(relativePattern)[0]
  }
}

const getFileType = (urlFile) => {
  const rgxPattern = /[^.][0-9a-z]*$/g
  const extensionRgx = new RegExp(rgxPattern)

  return urlFile.match(extensionRgx)[0]
}

const getFileName = (urlFile) => {
  return urlFile.substr(urlFile.lastIndexOf('/') + 1)
}
