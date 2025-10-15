import { render, screen } from '@testing-library/react'
import { AssetCard } from '@/components/AssetCard'

describe('AssetCard', () => {
  const mockAsset = {
    id: 'asset-1',
    name: 'Legendary Sword',
    game: 'Eternum',
    gameIcon: '⚔️',
    price: '0.001',
    image: '🗡️',
    rarity: 'Legendary' as const,
    attributes: {
      Attack: 100,
      Defense: 50,
      Speed: 75,
    },
    seller: '0x1234...5678',
  }

  it('renders asset information correctly', () => {
    render(<AssetCard {...mockAsset} />)

    expect(screen.getByText('Legendary Sword')).toBeInTheDocument()
    expect(screen.getByText('Eternum')).toBeInTheDocument()
    expect(screen.getByText('0.001 BTC')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
  })

  it('displays rarity badge with correct color', () => {
    const { rerender } = render(<AssetCard {...mockAsset} rarity="Common" />)
    expect(screen.getByText('Common')).toHaveClass('text-gray-400')

    rerender(<AssetCard {...mockAsset} rarity="Rare" />)
    expect(screen.getByText('Rare')).toHaveClass('text-blue-400')

    rerender(<AssetCard {...mockAsset} rarity="Epic" />)
    expect(screen.getByText('Epic')).toHaveClass('text-purple-400')

    rerender(<AssetCard {...mockAsset} rarity="Legendary" />)
    expect(screen.getByText('Legendary')).toHaveClass('text-orange-400')

    rerender(<AssetCard {...mockAsset} rarity="Mythical" />)
    expect(screen.getByText('Mythical')).toHaveClass('text-pink-400')
  })

  it('displays first 3 attributes when provided', () => {
    render(<AssetCard {...mockAsset} />)

    expect(screen.getByText(/Attack:/)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText(/Defense:/)).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText(/Speed:/)).toBeInTheDocument()
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('limits attributes display to first 3', () => {
    const assetWithManyAttributes = {
      ...mockAsset,
      attributes: {
        Attack: 100,
        Defense: 50,
        Speed: 75,
        Magic: 60,
        Stamina: 80,
      },
    }

    render(<AssetCard {...assetWithManyAttributes} />)

    expect(screen.getByText(/Attack:/)).toBeInTheDocument()
    expect(screen.getByText(/Defense:/)).toBeInTheDocument()
    expect(screen.getByText(/Speed:/)).toBeInTheDocument()
    expect(screen.queryByText(/Magic:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Stamina:/)).not.toBeInTheDocument()
  })

  it('handles missing attributes gracefully', () => {
    const assetWithoutAttributes = {
      ...mockAsset,
      attributes: undefined,
    }

    render(<AssetCard {...assetWithoutAttributes} />)

    expect(screen.queryByText(/Attack:/)).not.toBeInTheDocument()
    expect(screen.getByText('Legendary Sword')).toBeInTheDocument()
  })

  it('handles missing seller gracefully', () => {
    const assetWithoutSeller = {
      ...mockAsset,
      seller: undefined,
    }

    render(<AssetCard {...assetWithoutSeller} />)

    expect(screen.queryByText('Seller')).not.toBeInTheDocument()
    expect(screen.getByText('Legendary Sword')).toBeInTheDocument()
  })

  it('uses custom href when provided', () => {
    const customHref = '/custom/path/123'
    render(<AssetCard {...mockAsset} href={customHref} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', customHref)
  })

  it('uses default href pattern when custom href not provided', () => {
    render(<AssetCard {...mockAsset} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/asset/asset-1')
  })

  it('displays game icon', () => {
    render(<AssetCard {...mockAsset} />)

    expect(screen.getByText('⚔️')).toBeInTheDocument()
  })

  it('displays asset image emoji', () => {
    render(<AssetCard {...mockAsset} />)

    expect(screen.getByText('🗡️')).toBeInTheDocument()
  })
})
