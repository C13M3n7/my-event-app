<!--homepage-->

<main class="hero">
  <section class="intro">
    <h1>Discover & Experience Events Around You</h1>
    <p>From concerts to food festivals, City Services brings the city to your fingertips.</p>
    <a href="/events" class="cta-button">Browse Events</a>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Segoe UI', sans-serif;
    background: #f5f9f8;
    color: #1a1a1a;
  }

  .hero {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem 1rem;
    text-align: center;
    background: linear-gradient(135deg, #c1f0f6, #d9fce4);
    min-height: 80vh;
  }

  .intro {
    max-width: 600px;
    padding: 1.5rem;
  }

  h1 {
    font-size: 2rem;
    color: #075985;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    color: #2e2e2e;
  }

  .cta-button {
    background-color: #10b981;
    color: white;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }

  .cta-button:hover {
    background-color: #059669;
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1rem;
    }

    .cta-button {
      width: 100%;
    }
  }
</style>