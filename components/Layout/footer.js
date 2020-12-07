import React, { useState, useEffect } from 'react';
import styles from '../layout.module.scss'
export default function footer() {    
    return (
      <footer className={styles.site_footer}>
        <div className={styles.footer_container}>
          <h3>About</h3>
          <p>Sanctuary.com <i>Nothing to say </i></p>
        </div>
      </footer>
    )
  }