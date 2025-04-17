<script>
  export let data;

  // TypeScript version (if using TypeScript):
  // export let data: { status: 'success' | 'failed' | 'error' | 'invalid', paymentId?: string, message?: string };
</script>

<div class="callback-container" class:success={data.status === 'success'} class:failed={data.status === 'failed'} class:error={data.status === 'error'}>
  {#if data.status === 'success'}
    <h1>Payment Successful!</h1>
    <p>Thank you for your payment. Your transaction ID is: {data.paymentId}</p>
  
  {:else if data.status === 'failed'}
    <h1>Payment Failed</h1>
    <p>Sorry, your payment was not successful. Please try again.</p>
    {#if data.paymentId}
      <p class="reference">Reference: {data.paymentId}</p>
    {/if}
  
  {:else if data.status === 'error'}
    <h1>Processing Error</h1>
    <p>{data.message || 'An error occurred while processing your payment status.'}</p>
  
  {:else}
    <h1>Invalid Request</h1>
    <p>{data.message || 'Missing payment parameters.'}</p>
  {/if}
  
  <a href="/">Return to Home</a>
</div>

<style>
  .callback-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
  }
  
  h1 {
    color: var(--status-color);
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 0.5rem;
  }
  
  .reference {
    font-size: 0.9em;
    color: #666;
  }
  
  .success h1 {
    --status-color: green;
  }
  
  .failed h1,
  .error h1 {
    --status-color: red;
  }
  
  a {
    display: inline-block;
    margin-top: 20px;
    color: #4CAF50;
    text-decoration: none;
    font-weight: bold;
  }
</style>