fetch('http://localhost:3000/product/baby-cotton-cap-towel-baby-hooded-towels-size-30-30/D9ULcvjC1Wat6nmPLg0f').then(r => r.text()).then(html => console.log('LOCAL:', html.substring(0, 1500)));
