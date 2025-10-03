import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tourism',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tourism.component.html',
  styleUrls: ['./tourism.component.css']
})
export class TourismComponent {
  // Future: fetch tourism posts from backend
  posts: Array<{
    id: number;
    title: string;
    location: string;
    cover: string; // image URL placeholder
    excerpt: string;
    body: string;
    tags: string[];
    published: string; // ISO date
    expanded?: boolean;
  }> = [
    {
      id: 1,
      title: 'Sunrise Over Cabalian Bay',
      location: 'Cabalian Bay, San Juan',
      cover: 'https://picsum.photos/seed/cabalian-bay/960/540',
      excerpt: 'Golden hues reflect across the still waters of Cabalian Bay as local fishers begin their quiet routines.',
      body: 'At first light, Cabalian Bay offers a calm mirror of the sky. Small bancas drift outward, and the shoreline slowly wakes with soft chatter. This tranquil hour captures the spirit of San Juan—unhurried, resilient, and closely tied to the sea. Visitors often gather along the promenade to watch the evolving palette of color before heading to the public market for fresh produce and native delicacies.',
      tags: ['Sunrise','Nature','Seascape'],
      published: '2025-09-12'
    },
    {
      id: 2,
      title: 'Chasing Waterfalls in the Highlands',
      location: 'Mountain Barangays',
      cover: 'https://picsum.photos/seed/sanjuan-falls/960/540',
      excerpt: 'Hidden cascades surrounded by lush ferns reward early trekkers with cool mist and birdsong.',
      body: 'The upland trails above San Juan wind through coconut groves into denser secondary forest. Along the way, you pass small clearings used for root crop drying before reaching a series of stepped falls. The pools are shallow, crystal-clear, and refreshingly cold. Local guides point out native plants used for weaving and traditional remedies, adding cultural depth to the scenic hike.',
      tags: ['Adventure','Hiking','Waterfalls'],
      published: '2025-09-18'
    },
    {
      id: 3,
      title: 'Handcrafted Traditions at the Weekend Market',
      location: 'Poblacion Market',
      cover: 'https://picsum.photos/seed/sanjuan-market/960/540',
      excerpt: 'Weavers, woodcarvers, and home-style food makers gather each weekend to showcase living traditions.',
      body: 'Every weekend, the market square becomes a microcosm of municipal life. Artisans lay out woven mats, carved coconut shells, and hand-dyed fabrics. The aroma of kakanin—banana leaf-wrapped rice treats and cassava cakes—fills the air. Interactions between visitors and makers help sustain heritage crafts. Purchasing locally produced goods directly contributes to household livelihoods and encourages cultural continuity.',
      tags: ['Culture','Crafts','Market'],
      published: '2025-09-25'
    }
  ];

  toggle(post: { id: number; expanded?: boolean }) {
    post.expanded = !post.expanded;
  }

  trackByPost = (_: number, post: { id: number }) => post.id;
}
