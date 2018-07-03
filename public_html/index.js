const skygearEndpoint = '<your-skygear-app-endpoint>'
const skygearApiKey= '<your-skygear-app-api-key>'
const stripePublishableKey = '<your-stripe-publishable-key>'

skygear.config({
  endPoint: skygearEndpoint,
  apiKey: skygearApiKey
})

var handler = StripeCheckout.configure({
  key: stripePublishableKey,
  image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  locale: 'auto',
  token: function(token) {
    let product = getSelectedProduct()
    // call skygear lambda
    const params = {
      product_name: product.name,
      product_price: product.price,
      stripe_token: token.id,
      user_email: token.email
    }
    skygear.lambda('process_payment', params)
      .then(res => {
        console.log(res)
      })
  }
});

function getSelectedProduct() {
  let products = Array.from(document.getElementsByName('product'))
  let selectedProduct = products.find(r => r.checked)
  let selectedProductName = selectedProduct.dataset.name
  let selectedProductPriceToNum = selectedProduct.dataset.price*1

  let product = {
    name: selectedProductName,
    price: selectedProductPriceToNum
  }
  return product
}

function submitForm() {
  // Open Checkout with further options:
  let product = getSelectedProduct()
  let productName = product.name
  let productPrice = product.price

  handler.open({
    name: 'Skygear Coffee Shop',
    description: `Thanks for purchasing ${productName}!`,
    currency: 'usd',
    amount: productPrice
  });
  return false;
}

// Close Checkout on page navigation:
window.addEventListener('popstate', function() {
  handler.close();
});
