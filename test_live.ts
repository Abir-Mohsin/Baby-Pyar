fetch('https://babypyar.com/product/serve-your-little-ones-meals-with-fish-plate-baby-plate/Fc0722EtH3BHX3dnMKHE').then(r => r.text()).then(html => console.log(html.substring(0, 1500)));
