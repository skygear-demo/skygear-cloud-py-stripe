import skygear
import stripe
import uuid
from skygear.container import SkygearContainer
from skygear.options import options

stripe.api_key = '<your-stripe-private-key>'

def getSkygearContainer():
    container = SkygearContainer(
        api_key=options.masterkey,
        user_id='<your-user-id>'
    )
    return container

@skygear.op('process_payment')
def process_payment(product_name, product_price, stripe_token, user_email):
    try:
        charge = stripe.Charge.create(
            amount = product_price,
            currency = 'usd',
            description = f'Charging { product_price / 100 } USD for { product_name }',
            receipt_email = user_email,
            source = stripe_token,
            metadata = {
                'product': product_name
            }
        )
    except Exception as e:
        return{
            'results': 'failed'
        }

    try:
        payment_record = {
          '_access': [{'level': 'read', 'public': True}],
          '_id': 'payment_record/' + str(uuid.uuid4()),
          'receipt_email': charge.receipt_email,
          'amount': int(charge.amount)/100,
          'product': charge.metadata.product
        }
        master_container = getSkygearContainer()
        skygear_record = master_container.send_action(
          'record:save',
          {
              'database_id': '_public',
              'records': [payment_record]
          }
        )
        return skygear_record

    except Exception as e:
        return{
            'results': 'Skygear failed'
        }
