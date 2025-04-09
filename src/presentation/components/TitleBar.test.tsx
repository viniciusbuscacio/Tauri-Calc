import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TitleBar } from './TitleBar';
import { WindowService } from '../../infrastructure/WindowService';

jest.mock('../../infrastructure/WindowService', () => ({
  WindowService: {
    minimize: jest.fn(),
    toggleMaximize: jest.fn(),
    close: jest.fn(),
  }
}));

describe('TitleBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title and window control buttons', () => {
    render(<TitleBar />);
    
    expect(screen.getByText('Calc')).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument(); // minimize
    expect(screen.getByText('⛶')).toBeInTheDocument(); // maximize
    expect(screen.getByText('×')).toBeInTheDocument(); // close
  });

  it('should call minimize when minimize button is clicked', () => {
    render(<TitleBar />);
    
    fireEvent.click(screen.getByText('−'));
    expect(WindowService.minimize).toHaveBeenCalled();
  });

  it('should call toggleMaximize when maximize button is clicked', () => {
    render(<TitleBar />);
    
    fireEvent.click(screen.getByText('⛶'));
    expect(WindowService.toggleMaximize).toHaveBeenCalled();
  });

  it('should call close when close button is clicked', () => {
    render(<TitleBar />);
    
    fireEvent.click(screen.getByText('×'));
    expect(WindowService.close).toHaveBeenCalled();
  });
});