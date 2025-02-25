Pip.typeText("Hello World!").then(() =>
    setTimeout(() => {
      Pip.typeText("Nice app!").then(() => {
        setTimeout(() => {
          submenuApps()
        }, 3000)
      })
    }, 3000)
  )