import { Request, Response } from "express";
import { Collection } from "../../../database/model/collectionModel";
import { Testimonial } from "../../../database/model/reviewsModel";
import { Perfume } from "../../../database/model/perfumeModel";
import { validationResult } from "express-validator";

// Get homepage data (featured products, collections, testimonials)
export const getHomepageData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get featured perfumes
    const featuredPerfumes = await Perfume.find({ featured: true })
      .select('name brand price sizes imageUrl type')
      .lean();

    // Get all collections with their perfumes
    const collections = await Collection.find()
      .populate({
        path: 'perfumes',
        select: 'name imageUrl'
      })
      .lean();

    // Get all testimonials
    const testimonials = await Testimonial.find()
      .select('imageUrl')
      .lean();

    // Transform data to match frontend expectations
    const featuredItems = featuredPerfumes.map(perfume => ({
      _id: perfume._id.toString(),
      name: perfume.name,
      brand: perfume.brand || '',
      price: perfume.price,
      sizes: perfume.sizes?.map(size => ({
        label: size.label,
        price: size.price
      })) || [],
      image: perfume.imageUrl || '',
      type: perfume.type
    }));

    const collectionsData = collections.map(collection => ({
      _id: collection._id.toString(),
      title: collection.name,
      description: collection.description || '',
      products: collection.perfumes.map((perfume: any) => ({
        _id: perfume._id.toString(),
        name: perfume.name,
        image: perfume.imageUrl || ''
      }))
    }));

    const feedbacks = testimonials.map(testimonial => ({
      _id: testimonial._id.toString(),
      screenshot: testimonial.imageUrl
    }));

    res.status(200).json({
      success: true,
      data: {
        featuredItems,
        collections: collectionsData,
        feedbacks
      }
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage data'
    });
  }
};

// Collections CRUD
export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const collections = await Collection.find()
      .populate('perfumes', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collections'
    });
  }
};

export const getCollectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id)
      .populate('perfumes', 'name imageUrl price brand type');

    if (!collection) {
       res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection'
    });
  }
};

export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, perfumes, image, featured } = req.body;

    const collection = new Collection({
      name,
      description,
      perfumes: perfumes || [],
      image,
      featured: featured || false
    });

    await collection.save();

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: collection
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating collection'
    });
  }
};

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, perfumes, image, featured } = req.body;

    const collection = await Collection.findByIdAndUpdate(
      id,
      {
        name,
        description,
        perfumes,
        image,
        featured
      },
      { new: true }
    ).populate('perfumes', 'name imageUrl');

    if (!collection) {
       res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Collection updated successfully',
      data: collection
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating collection'
    });
  }
};

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const collection = await Collection.findByIdAndDelete(id);

    if (!collection) {
       res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting collection'
    });
  }
};

// Testimonials CRUD
export const getTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials'
    });
  }
};

export const getTestimonialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
       res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonial'
    });
  }
};

export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { imageUrl, featured } = req.body;

    const testimonial = new Testimonial({
      imageUrl,
      featured: featured || false
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating testimonial'
    });
  }
};

export const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { imageUrl, featured } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      {
        imageUrl,
        featured
      },
      { new: true }
    );

    if (!testimonial) {
       res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating testimonial'
    });
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
       res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting testimonial'
    });
  }
};