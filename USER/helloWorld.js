Pip.typeText("Hello World!").then(() =>setTimeout(() => 
  {
      Pip.typeText("Games, am I right?!").then(() => {
        setTimeout(() => {
          Pip.typeText("Ігри!").then(() => {submenuApps()}, 3000)
        }, 3000)
      })
    }, 3000)
  )
  